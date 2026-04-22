import { useMemo } from 'react'

import { type LibrarySong } from '../types'
import { sortAlphabetical } from '../sort/sort_alphabetical'

export function useArtistNames(library: LibrarySong[]): string[] {
	return useMemo((): string[] => {
		const names = new Set<string>()

		for (const song of library) {
			const artist = song.metadata.common.artist ?? ''

			if (artist.length > 0) {
				names.add(artist)
			}
		}

		return Array.from(names).sort(sortAlphabetical)
	}, [library])
}
