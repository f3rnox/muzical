import {
	PLAYER_CANDIDATES,
	type PlayerCandidate,
	type PlayerName,
} from "../utils/player_candidates";
import { isBinaryAvailable } from "../utils/is_binary_available";
import { resolvePlayer } from "../utils/resolve_player";

export interface PrintPlayerOptions {
	player?: PlayerName | null;
	all?: boolean;
}

/**
 * Prints the resolved playback backend, or lists all candidates with availability when `all` is true.
 *
 * @param options - Optional forced player and `--all` listing mode.
 */
export function printPlayer(options: Readonly<PrintPlayerOptions> = {}): void {
	if (options.all === true) {
		for (const candidate of PLAYER_CANDIDATES) {
			const available = isBinaryAvailable(candidate.bin);
			const mark = available ? "available" : "missing";
			process.stdout.write(
				`${candidate.name.padEnd(8)} ${candidate.bin.padEnd(8)} ${mark}\n`,
			);
		}

		return;
	}

	const selected: PlayerCandidate | null = resolvePlayer(
		options.player ?? null,
	);

	if (selected === null) {
		const label = options.player ?? "any supported player";
		process.stderr.write(`No playback backend available for ${label}\n`);
		process.exit(1);
	}

	process.stdout.write(`${selected.name} (${selected.bin})\n`);
}
