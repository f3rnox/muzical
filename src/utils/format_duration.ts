/**
 * Formats a duration in seconds as `H:MM:SS`, `M:SS`, or `--:--` when missing or non-finite.
 *
 * @param seconds - Length in seconds, or `undefined` for unknown duration.
 * @returns A compact clock string suitable for status and list rows.
 */
export function formatDuration(seconds: number | undefined): string {
	if (seconds === undefined || !Number.isFinite(seconds)) {
		return "--:--";
	}

	const total = Math.max(0, Math.floor(seconds));
	const hours = Math.floor(total / 3600);
	const minutes = Math.floor((total % 3600) / 60);
	const secs = total % 60;
	/** Pads a non-negative integer to two digits for clock display. */
	const pad = (n: number): string => n.toString().padStart(2, "0");

	if (hours > 0) {
		return `${hours}:${pad(minutes)}:${pad(secs)}`;
	}

	return `${minutes}:${pad(secs)}`;
}
