import { Command, InvalidArgumentError, Option } from "commander";

import { listLibrary, type ListKind } from "./commands/list_library";
import { printConfig } from "./commands/print_config";
import { printPlayer } from "./commands/print_player";
import { runTui } from "./commands/run_tui";
import { scanLibrary } from "./commands/scan_library";
import { getPackageVersion } from "./utils/get_package_version";
import { isPlayerName, PLAYER_NAMES } from "./utils/resolve_player";
import { type PlayerName } from "./utils/player_candidates";

interface RootOptions {
	musicDir?: string;
	extension?: string[];
	player?: PlayerName;
	config?: string;
	clearScreen: boolean;
}

interface ConfigCommandOptions {
	musicDir?: string;
	extension?: string[];
	config?: string;
}

interface PlayerCommandOptions {
	player?: PlayerName;
	all?: boolean;
}

interface ScanCommandOptions extends ConfigCommandOptions {
	json?: boolean;
}

interface ListCommandOptions extends ScanCommandOptions {
	artist?: string;
	album?: string;
}

const LIST_KINDS: readonly ListKind[] = ["artists", "albums", "songs"];

/**
 * Parses a CLI `--player` value into a known {@link PlayerName}, or throws for invalid input.
 *
 * @param value - Raw player name from the argument parser.
 * @returns The validated player name.
 */
const parsePlayer = (value: string): PlayerName => {
	if (!isPlayerName(value)) {
		throw new InvalidArgumentError(
			`Unknown player '${value}'. Expected one of: ${PLAYER_NAMES.join(", ")}`,
		);
	}

	return value;
};

/**
 * Parses the `muzical list <kind>` positional into a {@link ListKind}, or throws for invalid input.
 *
 * @param value - Raw list kind string from the argument parser.
 * @returns The validated list kind.
 */
const parseListKind = (value: string): ListKind => {
	if (!(LIST_KINDS as readonly string[]).includes(value)) {
		throw new InvalidArgumentError(
			`Unknown list kind '${value}'. Expected one of: ${LIST_KINDS.join(", ")}`,
		);
	}

	return value as ListKind;
};

/**
 * Commander repeatable-option accumulator: appends one extension string to the collected list.
 *
 * @param value - A single extension token (with or without a leading dot).
 * @param previous - Previously collected extensions from prior invocations of the flag.
 * @returns A new array including `value` after `previous`.
 */
const appendExtension = (value: string, previous: string[] = []): string[] => [
	...previous,
	value,
];

/**
 * Builds the root `commander` program with global options and subcommands (`config`, `player`, `scan`, `list`).
 *
 * @returns The configured {@link Command} instance (not yet parsed).
 */
export function createCli(): Command {
	const program = new Command();

	program
		.name("muzical")
		.description("Terminal music browser and launcher (TUI)")
		.version(getPackageVersion(), "-v, --version", "output the current version")
		.showHelpAfterError("(run with --help for usage information)")
		.configureHelp({ sortSubcommands: true, sortOptions: true });

	program
		.option("-d, --music-dir <path>", "override music directory from config")
		.option(
			"-e, --extension <ext>",
			"additional/override song extension (repeatable, e.g. -e .mp3 -e .flac)",
			appendExtension,
		)
		.addOption(
			new Option("-p, --player <name>", "force playback backend")
				.choices([...PLAYER_NAMES])
				.argParser(parsePlayer),
		)
		.option("-c, --config <path>", "path to a custom config.json file")
		.option(
			"--no-clear-screen",
			"do not clear the terminal before/after running",
		)
		.action(async (options: RootOptions): Promise<void> => {
			await runTui({
				player: options.player ?? null,
				clearScreen: options.clearScreen,
				...(options.musicDir !== undefined && { musicDir: options.musicDir }),
				...(options.extension !== undefined && {
					songExtensions: options.extension,
				}),
				...(options.config !== undefined && { configPath: options.config }),
			});
		});

	program
		.command("config")
		.description("print the resolved configuration as JSON and exit")
		.option("-d, --music-dir <path>", "override music directory from config")
		.option(
			"-e, --extension <ext>",
			"additional/override song extension (repeatable)",
			appendExtension,
		)
		.option("-c, --config <path>", "path to a custom config.json file")
		.action(async (options: ConfigCommandOptions): Promise<void> => {
			await printConfig({
				...(options.musicDir !== undefined && { musicDir: options.musicDir }),
				...(options.extension !== undefined && {
					songExtensions: options.extension,
				}),
				...(options.config !== undefined && { configPath: options.config }),
			});
		});

	program
		.command("player")
		.description("print the detected playback backend and exit")
		.addOption(
			new Option("-p, --player <name>", "check a specific backend")
				.choices([...PLAYER_NAMES])
				.argParser(parsePlayer),
		)
		.option("-a, --all", "list all supported backends and their availability")
		.action((options: PlayerCommandOptions): void => {
			printPlayer({
				player: options.player ?? null,
				...(options.all !== undefined && { all: options.all }),
			});
		});

	program
		.command("scan")
		.description("scan the music library and print a summary without the TUI")
		.option("-d, --music-dir <path>", "override music directory from config")
		.option(
			"-e, --extension <ext>",
			"additional/override song extension (repeatable)",
			appendExtension,
		)
		.option("-c, --config <path>", "path to a custom config.json file")
		.option("--json", "emit machine-readable JSON")
		.action(async (options: ScanCommandOptions): Promise<void> => {
			await scanLibrary({
				...(options.musicDir !== undefined && { musicDir: options.musicDir }),
				...(options.extension !== undefined && {
					songExtensions: options.extension,
				}),
				...(options.config !== undefined && { configPath: options.config }),
				...(options.json !== undefined && { json: options.json }),
			});
		});

	program
		.command("list")
		.argument("<kind>", `what to list: ${LIST_KINDS.join("|")}`, parseListKind)
		.description("list artists, albums, or songs from the library")
		.option("-d, --music-dir <path>", "override music directory from config")
		.option(
			"-e, --extension <ext>",
			"additional/override song extension (repeatable)",
			appendExtension,
		)
		.option("-c, --config <path>", "path to a custom config.json file")
		.option("--artist <name>", "filter albums/songs by artist name")
		.option("--album <name>", "filter songs by album name")
		.option("--json", "emit machine-readable JSON")
		.action(
			async (kind: ListKind, options: ListCommandOptions): Promise<void> => {
				await listLibrary(kind, {
					...(options.musicDir !== undefined && { musicDir: options.musicDir }),
					...(options.extension !== undefined && {
						songExtensions: options.extension,
					}),
					...(options.config !== undefined && { configPath: options.config }),
					...(options.artist !== undefined && { artist: options.artist }),
					...(options.album !== undefined && { album: options.album }),
					...(options.json !== undefined && { json: options.json }),
				});
			},
		);

	program.addHelpText(
		"after",
		`\nExamples:\n  $ muzical\n  $ muzical --music-dir ~/Music --player mpv\n  $ muzical scan --json\n  $ muzical list artists\n  $ muzical list songs --artist 'Radiohead' --album 'OK Computer'\n  $ muzical player --all\n`,
	);

	return program;
}
