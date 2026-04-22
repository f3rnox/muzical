import { type LibrarySong } from '../types'

export function sortSongs(a: LibrarySong, b: LibrarySong): number {
	const da = a.metadata.common.disk?.no ?? 0
	const db = b.metadata.common.disk?.no ?? 0

	if (da !== db) {
		return da - db
	}

	const ta = a.metadata.common.track?.no ?? 0
	const tb = b.metadata.common.track?.no ?? 0

	if (ta !== tb) {
		return ta - tb
	}

	return (a.metadata.common.title ?? '').localeCompare(
		b.metadata.common.title ?? '',
		undefined,
		{ sensitivity: 'base' }
	)
}
