import { isBinaryAvailable } from './is_binary_available'
import { PLAYER_CANDIDATES, type PlayerCandidate } from './player_candidates'

export function detectPlayer(): PlayerCandidate | null {
	for (const candidate of PLAYER_CANDIDATES) {
		if (isBinaryAvailable(candidate.bin)) {
			return candidate
		}
	}

	return null
}
