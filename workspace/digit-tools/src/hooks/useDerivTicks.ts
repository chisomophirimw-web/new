import { useEffect, useMemo, useState } from 'react';
import { derivClient } from '../services/derivClient';
import type { DerivTick } from '../services/derivClient';

export type DigitStats = {
	digitCounts: number[];
	frequencyPercents: number[];
	currentLastDigit: number | null;
	currentStreakDigit: number | null;
	currentStreakLength: number;
	longestStreakByDigit: number[];
	suggestedDigits: number[];
	totalSamples: number;
};

const MAX_TICKS = 500;

function getLastDigit(value: number): number {
	const s = Math.abs(value).toFixed(2);
	const lastChar = s[s.length - 1];
	return Number(lastChar);
}

export function useDerivTicks(symbol: string) {
	const [ticks, setTicks] = useState<DerivTick[]>([]);

	useEffect(() => {
		let isMounted = true;
		setTicks([]);
		const unsubscribe = derivClient.subscribeTicks(symbol, (t) => {
			if (!isMounted) return;
			setTicks((prev) => {
				const next = [...prev, t].slice(-MAX_TICKS);
				return next;
			});
		});
		return () => {
			isMounted = false;
			unsubscribe();
		};
	}, [symbol]);

	const stats: DigitStats = useMemo(() => {
		const digits = ticks.map((t) => getLastDigit(t.quote));
		const counts = Array(10).fill(0) as number[];
		for (const d of digits) counts[d]++;
		const total = digits.length || 1;
		const percents = counts.map((c) => (c / total) * 100);

		let currentStreakDigit: number | null = null;
		let currentStreakLength = 0;
		if (digits.length > 0) {
			currentStreakDigit = digits[digits.length - 1];
			for (let i = digits.length - 1; i >= 0; i--) {
				if (digits[i] === currentStreakDigit) currentStreakLength++;
				else break;
			}
		}

		const longestStreakByDigit = Array(10).fill(0) as number[];
		let streakLen = 0;
		for (let i = 0; i < digits.length; i++) {
			if (i === 0 || digits[i] === digits[i - 1]) streakLen++;
			else streakLen = 1;
			longestStreakByDigit[digits[i]] = Math.max(longestStreakByDigit[digits[i]], streakLen);
		}

		const suggestedDigits = counts
			.map((c, d) => ({ d, diff: (c / total) - 0.1 }))
			.sort((a, b) => a.diff - b.diff)
			.filter((x) => x.diff < -0.02)
			.slice(0, 3)
			.map((x) => x.d);

		return {
			digitCounts: counts,
			frequencyPercents: percents,
			currentLastDigit: digits.length ? digits[digits.length - 1] : null,
			currentStreakDigit,
			currentStreakLength,
			longestStreakByDigit,
			suggestedDigits,
			totalSamples: digits.length,
		};
	}, [ticks]);

	return { ticks, stats };
}