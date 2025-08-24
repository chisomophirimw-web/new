import SymbolSelector from '../components/SymbolSelector';
import { useDerivTicks } from '../hooks/useDerivTicks';

type Props = {
	symbol: string;
	onChangeSymbol: (s: string) => void;
};

export default function AnalysisView({ symbol, onChangeSymbol }: Props) {
	const { stats } = useDerivTicks(symbol);
	const maxCount = Math.max(...stats.digitCounts, 1);

	return (
		<div style={{ padding: 12 }}>
			<SymbolSelector value={symbol} onChange={onChangeSymbol} />
			<div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
				Samples: {stats.totalSamples} | Current last digit:{' '}
				<strong>{stats.currentLastDigit ?? '-'}</strong> | Streak:{' '}
				<strong>
					{stats.currentStreakDigit ?? '-'} × {stats.currentStreakLength}
				</strong>
			</div>

			<div style={{ marginTop: 12 }}>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 8 }}>
					{Array.from({ length: 10 }).map((_, d) => {
						const count = stats.digitCounts[d];
						const height = (count / maxCount) * 100;
						return (
							<div key={d} style={{ textAlign: 'center' }}>
								<div style={{ height: 100, display: 'flex', alignItems: 'flex-end' }}>
									<div
										style={{
											height: `${height}%`,
											width: '100%',
											background: d === stats.currentLastDigit ? '#646cff' : '#8884d8',
											borderRadius: 6,
										}}
									/>
								</div>
								<div style={{ fontSize: 12, marginTop: 4 }}>{d}</div>
								<div style={{ fontSize: 10, opacity: 0.8 }}>{count}</div>
							</div>
						);
					})}
				</div>
			</div>

			<div style={{ marginTop: 16 }}>
				<div style={{ fontWeight: 600, marginBottom: 6 }}>Suggested digits (under 10%)</div>
				{stats.suggestedDigits.length === 0 ? (
					<div style={{ fontSize: 12, opacity: 0.8 }}>No strong suggestions now.</div>
				) : (
					<div style={{ display: 'flex', gap: 8 }}>
						{stats.suggestedDigits.map((d) => (
							<span key={d} style={{ padding: '6px 10px', background: '#f0f0f0', borderRadius: 9999 }}>{d}</span>
						))}
					</div>
				)}
			</div>
		</div>
	);
}