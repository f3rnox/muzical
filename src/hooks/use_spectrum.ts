import { useEffect, useState } from "react";

const DECAY = 0.78;
const BEAT_INTERVAL_MS = 520;
const EXCITE_PROBABILITY = 0.35;
const IDLE_EPSILON = 0.001;
const DEFAULT_TICK_MS = 140;

export interface UseSpectrumOptions {
	bars: number;
	isPlaying: boolean;
	tickMs?: number;
}

/**
 * Animated pseudo-audio spectrum generator that decays to silence when playback stops.
 *
 * Produces a bass-weighted envelope with randomized excitations and periodic beat pulses,
 * suitable for a TUI-style bar chart visualizer.
 *
 * @param options - Number of bars, whether audio is currently playing, and tick cadence.
 * @returns Array of bar magnitudes in `[0, 1]`, length equal to `options.bars`.
 */
export function useSpectrum(options: Readonly<UseSpectrumOptions>): number[] {
	const { bars, isPlaying, tickMs = DEFAULT_TICK_MS } = options;
	const [values, setValues] = useState<number[]>((): number[] =>
		new Array<number>(Math.max(0, bars)).fill(0),
	);

	useEffect((): (() => void) => {
		const id: ReturnType<typeof setInterval> = setInterval((): void => {
			setValues((prev: number[]): number[] => {
				const size: number = Math.max(0, bars);
				const beatProb: number = isPlaying
					? Math.min(1, tickMs / BEAT_INTERVAL_MS)
					: 0;
				const beatActive: boolean = Math.random() < beatProb;
				const next: number[] = new Array<number>(size);
				let changed: boolean = prev.length !== size;

				for (let i = 0; i < size; i += 1) {
					const t: number = size <= 1 ? 0 : i / (size - 1);
					const envelope: number = 0.35 + 0.65 * Math.pow(1 - t, 1.4);
					const decayed: number = (prev[i] ?? 0) * DECAY;

					if (!isPlaying) {
						next[i] = decayed < IDLE_EPSILON ? 0 : decayed;
					} else {
						const excite: number =
							Math.random() < EXCITE_PROBABILITY ? Math.random() * envelope : 0;
						const beat: number = beatActive
							? 0.55 * Math.pow(1 - t, 0.6) * (0.6 + 0.4 * Math.random())
							: 0;
						next[i] = Math.min(1, Math.max(decayed, excite, beat));
					}

					if (!changed && Math.abs(next[i] - (prev[i] ?? 0)) > IDLE_EPSILON) {
						changed = true;
					}
				}

				return changed ? next : prev;
			});
		}, tickMs);

		return (): void => {
			clearInterval(id);
		};
	}, [bars, isPlaying, tickMs]);

	return values;
}
