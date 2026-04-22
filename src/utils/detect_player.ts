import { isBinaryAvailable } from './is_binary_available'
import { PLAYER_CANDIDATES, type PlayerCandidate } from './player_candidates'

/**
 * Returns the first configured player whose host binary is found on `PATH`.
 *
 * @returns The first available {@link PlayerCandidate}, or `null` if none are installed.
 */
export function detectPlayer(): PlayerCandidate | null {
	for (const candidate of PLAYER_CANDIDATES) {
		if (isBinaryAvailable(candidate.bin)) {
			return candidate
		}
	}

	return null
}
