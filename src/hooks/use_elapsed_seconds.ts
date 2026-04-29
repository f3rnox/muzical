import { useEffect, useState } from "react";

const TICK_MS = 500;

/** No-op cleanup for `useEffect` when playback is idle (no interval to clear). */
function noop(): void {
	return;
}

/**
 * Returns elapsed playback seconds since `startedAt`, ticking periodically while playing.
 *
 * @param startedAt - Wall-clock ms when the current track began, or `null` when idle.
 * @returns Elapsed seconds since `startedAt`, or `0` when not playing.
 */
export function useElapsedSeconds(startedAt: number | null): number {
	const [now, setNow] = useState<number>((): number => Date.now());

	useEffect((): (() => void) => {
		if (startedAt === null) {
			return noop;
		}

		setNow(Date.now());

		const id = setInterval((): void => {
			setNow(Date.now());
		}, TICK_MS);

		return (): void => {
			clearInterval(id);
		};
	}, [startedAt]);

	if (startedAt === null) {
		return 0;
	}

	return Math.max(0, (now - startedAt) / 1000);
}
