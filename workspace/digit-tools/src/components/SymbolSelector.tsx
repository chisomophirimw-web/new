import { useEffect, useState } from 'react';
import { derivClient } from '../services/derivClient';
import type { DerivActiveSymbol } from '../services/derivClient';

type Props = {
	value: string;
	onChange: (symbol: string) => void;
};

export default function SymbolSelector({ value, onChange }: Props) {
	const [symbols, setSymbols] = useState<DerivActiveSymbol[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		let mounted = true;
		setLoading(true);
		derivClient
			.getActiveSymbols()
			.then((list) => {
				if (!mounted) return;
				// Prefer volatility indices
				const preferred = list.filter((s) => s.market === 'synthetic_index');
				setSymbols(preferred.length ? preferred : list);
			})
			.finally(() => setLoading(false));
		return () => {
			mounted = false;
		};
	}, []);

	return (
		<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
			<label style={{ fontSize: 14 }}>Symbol</label>
			<select
				value={value}
				onChange={(e) => onChange(e.target.value)}
				style={{ flex: 1, padding: 8, borderRadius: 6 }}
				disabled={loading}
			>
				{symbols.map((s) => (
					<option key={s.symbol} value={s.symbol}>
						{s.display_name}
					</option>
				))}
			</select>
		</div>
	);
}