import { promises as fs } from "node:fs";
import path from "node:path";

import { type Config } from "../load_config";

/**
 * Persists a {@link Config} snapshot to `configPath` as indented JSON, creating the parent directory if needed.
 *
 * @param configPath - Absolute path to the target `config.json`.
 * @param config - Full configuration to serialize (plain JSON-safe fields only).
 */
export async function writeConfig(
	configPath: string,
	config: Readonly<Config>,
): Promise<void> {
	const dir = path.dirname(configPath);
	await fs.mkdir(dir, { recursive: true });

	const serializable = {
		musicDir: config.musicDir,
		songExtensions: config.songExtensions,
		soulseekUsername: config.soulseekUsername,
		soulseekPassword: config.soulseekPassword,
	};

	await fs.writeFile(
		configPath,
		`${JSON.stringify(serializable, null, 2)}\n`,
		"utf-8",
	);
}
