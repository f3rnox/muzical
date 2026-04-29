import { type PlayerCandidate } from "./player_candidates";

export type BuildPlayerArgsOptions = Readonly<{
	volume: number;
	mpvIpcPath?: string;
}>;

/**
 * Builds the argv array passed to `spawn` for a given player and audio file path.
 *
 * @param player - Resolved backend definition (binary name and static args).
 * @param filePath - Absolute path to the track to play.
 * @param options - Optional per-session volume (0–100) and mpv IPC path for live control.
 * @returns Argument list: player args, file path, then optional suffix args (e.g. VLC quit URI).
 */
export function buildPlayerArgs(
	player: Readonly<PlayerCandidate>,
	filePath: string,
	options?: Readonly<BuildPlayerArgsOptions>,
): string[] {
	const volume = options?.volume ?? 100;
	const clamped = Math.max(0, Math.min(100, volume));

	if (player.name === "mpv") {
		return [
			...player.args,
			`--volume=${clamped}`,
			...(options?.mpvIpcPath !== undefined
				? [`--input-ipc-server=${options.mpvIpcPath}`]
				: []),
			filePath,
			...(player.suffixArgs ?? []),
		];
	}

	if (player.name === "mpg123") {
		const scale: number = Math.max(0, Math.round((clamped / 100) * 256));
		return [
			...player.args,
			"-f",
			String(scale),
			filePath,
			...(player.suffixArgs ?? []),
		];
	}

	if (player.name === "ffplay") {
		return [
			...player.args,
			"-af",
			`volume=${(clamped / 100).toFixed(2)}`,
			filePath,
			...(player.suffixArgs ?? []),
		];
	}

	return [...player.args, filePath, ...(player.suffixArgs ?? [])];
}
