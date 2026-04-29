import loadConfig, { type LoadConfigOptions } from "../load_config";

/**
 * Resolves configuration (CLI overrides applied) and prints it as formatted JSON to stdout.
 *
 * @param options - Optional config path, music directory, and extension overrides.
 */
export async function printConfig(
	options: Readonly<LoadConfigOptions> = {},
): Promise<void> {
	const config = await loadConfig(options);
	process.stdout.write(`${JSON.stringify(config, null, 2)}\n`);
}
