export type DerivActiveSymbol = {
	symbol: string;
	display_name: string;
	market: string;
	submarket: string;
};

export type DerivTick = {
	symbol: string;
	epoch: number;
	quote: number;
};

const APP_ID = (import.meta as any).env?.VITE_DERIV_APP_ID || '1089';
const WS_URL = `wss://ws.binaryws.com/websockets/v3?app_id=${APP_ID}`;

class DerivWSClient {
	private socket: WebSocket | null = null;
	private isOpen = false;
	private nextRequestId = 1;
	private pendingResolvers: Map<number, (data: any) => void> = new Map();

	constructor() {
		this.connect();
	}

	private connect() {
		this.socket = new WebSocket(WS_URL);
		this.socket.onopen = () => {
			this.isOpen = true;
		};
		this.socket.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				const requestId = data.req_id as number | undefined;
				if (requestId && this.pendingResolvers.has(requestId)) {
					const resolver = this.pendingResolvers.get(requestId)!;
					this.pendingResolvers.delete(requestId);
					resolver(data);
				}
			} catch {
				// ignore parse errors
			}
		};
		this.socket.onclose = () => {
			this.isOpen = false;
			// try to reconnect after a short delay
			setTimeout(() => this.connect(), 1000);
		};
	}

	private send<T = any>(payload: Record<string, unknown>): Promise<T> {
		return new Promise((resolve) => {
			const ensureSend = () => {
				if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
					setTimeout(ensureSend, 50);
					return;
				}
				const reqId = this.nextRequestId++;
				const message = JSON.stringify({ ...payload, req_id: reqId });
				this.pendingResolvers.set(reqId, (data) => resolve(data as T));
				this.socket!.send(message);
			};
			ensureSend();
		});
	}

	async getActiveSymbols(): Promise<DerivActiveSymbol[]> {
		const response = await this.send<{ active_symbols: any[] }>({
			active_symbols: 'brief',
			product_type: 'basic',
		});
		const symbols = (response as any).active_symbols as any[];
		return symbols.map((s) => ({
			symbol: s.symbol,
			display_name: s.display_name,
			market: s.market,
			submarket: s.submarket,
		}));
	}

	subscribeTicks(symbol: string, onTick: (tick: DerivTick) => void): () => void {
		let streamId: string | undefined;

		const handleMessage = (event: MessageEvent) => {
			try {
				const data = JSON.parse(event.data);
				if (data.tick && data.tick.symbol === symbol) {
					const tick = data.tick;
					streamId = tick?.id || data?.subscription?.id || streamId;
					onTick({ symbol, epoch: Number(tick.epoch), quote: Number(tick.quote) });
				}
			} catch {
				// ignore
			}
		};

		const start = () => {
			if (!this.socket) return;
			this.socket.addEventListener('message', handleMessage);
			this.send({ ticks: symbol, subscribe: 1 }).catch(() => {});
		};

		if (this.isOpen) {
			start();
		} else {
			// wait until open
			const waitId = setInterval(() => {
				if (this.isOpen) {
					clearInterval(waitId);
					start();
				}
			}, 50);
		}

		return () => {
			if (!this.socket) return;
			this.socket.removeEventListener('message', handleMessage);
			if (streamId) {
				this.send({ unsubscribe: streamId }).catch(() => {});
			}
		};
	}
}

export const derivClient = new DerivWSClient();