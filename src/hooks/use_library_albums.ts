import { useMemo } from 'react'

import { type LibraryAlbum, type LibrarySong } from '../types'

/**
 * Groups library songs into album buckets keyed by artist+album metadata for the middle TUI column.
 *
 * @param library - All songs currently in scope.
 * @returns Album aggregates with shared artist label and song arrays.
 */
export function useLibraryAlbums(library: LibrarySong[]): LibraryAlbum[] {
	return useMemo((): LibraryAlbum[] => {
		const map = new Map<string, LibraryAlbum>()

		for (const song of library) {
			const artist = song.metadata.common.artist ?? ''
			const album = song.metadata.common.album ?? ''
			const key = `${artist}\u0000${album}`
			const existing = map.get(key)

			if (existing === undefined) {
				map.set(key, { name: album, artists: [artist], songs: [song] })
			} else {
				existing.songs.push(song)
			}
		}

		return Array.from(map.values())
	}, [library])
}
