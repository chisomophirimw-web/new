import SymbolSelector from '../components/SymbolSelector';
import { useDerivTicks } from '../hooks/useDerivTicks';
import { useState } from 'react';

type Props = {
	symbol: string;
	onChangeSymbol: (s: string) => void;
};

export default function ManualTradingView({ symbol, onChangeSymbol }: Props) {
	const { stats } = useDerivTicks(symbol);
	const [selectedDigit, setSelectedDigit] = useState<number>(0);
	const [stake, setStake] = useState<number>(1);

	const selectedCount = stats.digitCounts[selectedDigit] || 0;
	const selectedPercent = stats.frequencyPercents[selectedDigit] || 0;

	return (
		<div style={{ padding: 12 }}>
			<SymbolSelector value={symbol} onChange={onChangeSymbol} />

			<div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
				<div style={{ flex: 1 }}>
					<label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Pick digit</label>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 8 }}>
						{Array.from({ length: 10 }).map((_, d) => (
							<button
								key={d}
								onClick={() => setSelectedDigit(d)}
								style={{
									padding: '10px 0',
									borderRadius: 8,
									border: '1px solid #ddd',
									background: d === selectedDigit ? '#646cff' : '#fff',
									color: d === selectedDigit ? '#fff' : '#000',
								}}
							>
								{d}
							</button>
						))}
					</div>
				</div>
				<div style={{ width: 120 }}>
					<label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Stake</label>
					<input
						type="number"
						min={0}
						step={0.1}
						value={stake}
						onChange={(e) => setStake(Number(e.target.value))}
						style={{ width: '100%', padding: 8, borderRadius: 6 }}
					/>
				</div>
			</div>

			<div style={{ marginTop: 16, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
				<div style={{ fontWeight: 600, marginBottom: 6 }}>Context</div>
				<div style={{ fontSize: 14 }}>
					Current last digit: <strong>{stats.currentLastDigit ?? '-'}</strong> | Streak:{' '}
					<strong>
						{stats.currentStreakDigit ?? '-'} × {stats.currentStreakLength}
					</strong>
				</div>
				<div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
					Digit {selectedDigit} in last {stats.totalSamples} ticks: {selectedCount} times ({selectedPercent.toFixed(1)}%)
				</div>
				<div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
					Heuristic hints: avoid entering during long streaks unless fading the streak. Digits tend to average near 10% over time.
				</div>
			</div>

			<div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
				<a
					href={`https://app.deriv.com/tnc/accept?redirect_to=trader`} target="_blank" rel="noreferrer"
					style={{ flex: 1, textAlign: 'center', padding: 12, borderRadius: 8, background: '#111', color: '#fff', textDecoration: 'none' }}
				>
					Open Deriv Trader
				</a>
				<div style={{ flex: 1, textAlign: 'center', padding: 12, borderRadius: 8, border: '1px dashed #aaa' }}>
					Stake: <strong>{stake.toFixed(2)}</strong>
				</div>
			</div>

			<div style={{ fontSize: 11, opacity: 0.6, marginTop: 8 }}>
				This tool does not execute trades. It provides live stats to assist manual decisions.
			</div>
		</div>
	);
}