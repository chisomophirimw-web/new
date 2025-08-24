import { useEffect, useState } from 'react';
import './App.css';
import AnalysisView from './views/AnalysisView';
import ManualTradingView from './views/ManualTradingView';

export default function App() {
	const [activeTab, setActiveTab] = useState<'analysis' | 'manual'>('analysis');
	const [symbol, setSymbol] = useState<string>('R_100');

	useEffect(() => {
		const saved = localStorage.getItem('selected_symbol');
		if (saved) setSymbol(saved);
	}, []);
	useEffect(() => {
		localStorage.setItem('selected_symbol', symbol);
	}, [symbol]);

	return (
		<div style={{ maxWidth: 520, margin: '0 auto', width: '100%' }}>
			<header style={{ position: 'sticky', top: 0, background: '#242424', zIndex: 10 }}>
				<div style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<div style={{ fontWeight: 700 }}>Digit Tools</div>
					<nav style={{ display: 'flex', gap: 8 }}>
						<button
							onClick={() => setActiveTab('analysis')}
							style={{
								padding: '8px 12px',
								borderRadius: 9999,
								border: '1px solid #333',
								background: activeTab === 'analysis' ? '#646cff' : 'transparent',
								color: activeTab === 'analysis' ? '#fff' : '#ddd',
							}}
						>
							Analysis
						</button>
						<button
							onClick={() => setActiveTab('manual')}
							style={{
								padding: '8px 12px',
								borderRadius: 9999,
								border: '1px solid #333',
								background: activeTab === 'manual' ? '#646cff' : 'transparent',
								color: activeTab === 'manual' ? '#fff' : '#ddd',
							}}
						>
							Manual
						</button>
					</nav>
				</div>
			</header>

			<main>
				{activeTab === 'analysis' ? (
					<AnalysisView symbol={symbol} onChangeSymbol={setSymbol} />
				) : (
					<ManualTradingView symbol={symbol} onChangeSymbol={setSymbol} />
				)}
			</main>

			<footer style={{ padding: 12, fontSize: 11, opacity: 0.6, textAlign: 'center' }}>
				For education only. Not financial advice. Powered by Deriv WebSocket API.
			</footer>
		</div>
	);
}
