import loadConfig, { type LoadConfigOptions } from "../load_config";
import loadLibrary from "../load_library";
import loadMusicDir from "../load_music_dir";

export interface ScanLibraryOptions extends LoadConfigOptions {
	json?: boolean;
}

interface ScanSummary {
	musicDir: string;
	songExtensions: string[];
	totalFiles: number;
	totalArtists: number;
	totalAlbums: number;
}

/**
 * Scans the configured music directory, loads metadata, and prints a summary (or JSON) to stdout.
 *
 * @param options - Config overrides and optional `--json` output.
 */
export async function scanLibrary(
	options: Readonly<ScanLibraryOptions> = {},
): Promise<void> {
	const config = await loadConfig(options);
	const files = await loadMusicDir(config.musicDir, config.songExtensions);
	const library = await loadLibrary(files);

	const artists = new Set<string>();
	const albums = new Set<string>();

	for (const song of library) {
		const artist = song.metadata.common.artist ?? "";
		const album = song.metadata.common.album ?? "";

		if (artist.length > 0) {
			artists.add(artist);
		}

		albums.add(`${artist}\u0000${album}`);
	}

	const summary: ScanSummary = {
		musicDir: config.musicDir,
		songExtensions: config.songExtensions,
		totalFiles: library.length,
		totalArtists: artists.size,
		totalAlbums: albums.size,
	};

	if (options.json === true) {
		process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);

		return;
	}

	process.stdout.write(`music dir:   ${summary.musicDir}\n`);
	process.stdout.write(`extensions:  ${summary.songExtensions.join(", ")}\n`);
	process.stdout.write(`songs:       ${summary.totalFiles}\n`);
	process.stdout.write(`artists:     ${summary.totalArtists}\n`);
	process.stdout.write(`albums:      ${summary.totalAlbums}\n`);
}
