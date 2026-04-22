import { type PlayerCandidate } from './player_candidates'

/**
 * Builds the argv array passed to `spawn` for a given player and audio file path.
 *
 * @param player - Resolved backend definition (binary name and static args).
 * @param filePath - Absolute path to the track to play.
 * @returns Argument list: player args, file path, then optional suffix args (e.g. VLC quit URI).
 */
export function buildPlayerArgs(
	player: Readonly<PlayerCandidate>,
	filePath: string
): string[] {
	return [...player.args, filePath, ...(player.suffixArgs ?? [])]
}
