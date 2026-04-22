import { detectPlayer } from './detect_player'
import { isBinaryAvailable } from './is_binary_available'
import { PLAYER_CANDIDATES, type PlayerCandidate, type PlayerName } from './player_candidates'

export const PLAYER_NAMES: readonly PlayerName[] = PLAYER_CANDIDATES.map(
	(candidate: PlayerCandidate): PlayerName => candidate.name
)

/**
 * Narrows a string to a supported backend id when it matches a known player name.
 *
 * @param value - Arbitrary string (often from CLI parsing).
 * @returns Type predicate: `true` when `value` is a {@link PlayerName}.
 */
export function isPlayerName(value: string): value is PlayerName {
	return (PLAYER_NAMES as readonly string[]).includes(value)
}

/**
 * Picks a playback backend: auto-detects the first available binary, or validates a forced player when present.
 *
 * @param forced - Optional player id to require; `null`/`undefined` means auto-detect.
 * @returns A candidate with an available binary, or `null` if none match.
 */
export function resolvePlayer(forced?: PlayerName | null): PlayerCandidate | null {
	if (forced === undefined || forced === null) {
		return detectPlayer()
	}

	const candidate = PLAYER_CANDIDATES.find(
		(entry: PlayerCandidate): boolean => entry.name === forced
	)

	if (candidate === undefined) {
		return null
	}

	if (!isBinaryAvailable(candidate.bin)) {
		return null
	}

	return candidate
}
