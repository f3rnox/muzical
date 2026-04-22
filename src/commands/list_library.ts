import loadConfig, { type LoadConfigOptions } from '../load_config'
import loadLibrary from '../load_library'
import loadMusicDir from '../load_music_dir'
import { sortAlphabetical } from '../sort/sort_alphabetical'
import { sortSongs } from '../sort/sort_songs'
import { type LibrarySong } from '../types'

export type ListKind = 'artists' | 'albums' | 'songs'

export interface ListLibraryOptions extends LoadConfigOptions {
	artist?: string
	album?: string
	json?: boolean
}

/**
 * Collects unique non-empty artist names from the library and sorts them alphabetically.
 *
 * @param library - Parsed songs with metadata.
 * @returns Sorted artist display names.
 */
const listArtists = (library: readonly LibrarySong[]): string[] => {
	const names = new Set<string>()

	for (const song of library) {
		const artist = song.metadata.common.artist ?? ''

		if (artist.length > 0) {
			names.add(artist)
		}
	}

	return Array.from(names).sort(sortAlphabetical)
}

/**
 * Collects unique non-empty album titles, optionally restricted to one artist.
 *
 * @param library - Parsed songs with metadata.
 * @param artistFilter - When set, only albums from this artist are included.
 * @returns Sorted album display names.
 */
const listAlbums = (
	library: readonly LibrarySong[],
	artistFilter?: string
): string[] => {
	const albums = new Set<string>()

	for (const song of library) {
		const artist = song.metadata.common.artist ?? ''
		const album = song.metadata.common.album ?? ''

		if (artistFilter !== undefined && artist !== artistFilter) {
			continue
		}

		if (album.length > 0) {
			albums.add(album)
		}
	}

	return Array.from(albums).sort(sortAlphabetical)
}

/**
 * Returns library songs filtered by optional artist and album, sorted for album playback order.
 *
 * @param library - Parsed songs with metadata.
 * @param artistFilter - When set, songs must match this artist.
 * @param albumFilter - When set, songs must match this album title.
 * @returns Matching songs, sorted by disk/track/title.
 */
const listSongs = (
	library: readonly LibrarySong[],
	artistFilter?: string,
	albumFilter?: string
): LibrarySong[] => {
	const filtered = library.filter((song: LibrarySong): boolean => {
		const artist = song.metadata.common.artist ?? ''
		const album = song.metadata.common.album ?? ''

		if (artistFilter !== undefined && artist !== artistFilter) {
			return false
		}

		if (albumFilter !== undefined && album !== albumFilter) {
			return false
		}

		return true
	})

	return [...filtered].sort(sortSongs)
}

/**
 * Formats one song as a human-readable line for plain-text `list songs` output.
 *
 * @param song - Song to describe.
 * @returns A single line with artist, album, and title (or path fallback).
 */
const formatSong = (song: Readonly<LibrarySong>): string => {
	const title = song.metadata.common.title ?? song.filePath
	const artist = song.metadata.common.artist ?? 'Unknown Artist'
	const album = song.metadata.common.album ?? 'Unknown Album'

	return `${artist} — ${album} — ${title}`
}

/**
 * Loads the library and prints artists, albums, or songs to stdout (optionally as JSON).
 *
 * @param kind - Which entity type to list.
 * @param options - Config overrides, optional filters, and JSON output toggle.
 */
export async function listLibrary(
	kind: ListKind,
	options: Readonly<ListLibraryOptions> = {}
): Promise<void> {
	const config = await loadConfig(options)
	const files = await loadMusicDir(config.musicDir, config.songExtensions)
	const library = await loadLibrary(files)

	if (kind === 'artists') {
		const artists = listArtists(library)

		if (options.json === true) {
			process.stdout.write(`${JSON.stringify(artists, null, 2)}\n`)

			return
		}

		for (const name of artists) {
			process.stdout.write(`${name}\n`)
		}

		return
	}

	if (kind === 'albums') {
		const albums = listAlbums(library, options.artist)

		if (options.json === true) {
			process.stdout.write(`${JSON.stringify(albums, null, 2)}\n`)

			return
		}

		for (const name of albums) {
			process.stdout.write(`${name}\n`)
		}

		return
	}

	const songs = listSongs(library, options.artist, options.album)

	if (options.json === true) {
		const payload = songs.map((song: LibrarySong) => ({
			filePath: song.filePath,
			title: song.metadata.common.title ?? null,
			artist: song.metadata.common.artist ?? null,
			album: song.metadata.common.album ?? null,
			track: song.metadata.common.track?.no ?? null,
			durationSeconds: song.metadata.format.duration ?? null
		}))
		process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`)

		return
	}

	for (const song of songs) {
		process.stdout.write(`${formatSong(song)}\n`)
	}
}
