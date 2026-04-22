import { type PlayerCandidate } from './player_candidates'

export function buildPlayerArgs(
	player: Readonly<PlayerCandidate>,
	filePath: string
): string[] {
	return [...player.args, filePath, ...(player.suffixArgs ?? [])]
}
