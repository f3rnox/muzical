import React from 'react'

import PlaylistList from '../components/playlist_list'
import { type LibrarySong, InputTarget } from '../types'

export interface PlaylistViewProps {
	maxRows: number
	visibleSongs: LibrarySong[]
	selectedSong: LibrarySong | null
	totalCount: number
}

/**
 * Single-column playlist view wrapping {@link PlaylistList} with view-owned focus semantics.
 *
 * @param props - Filtered playlist entries, current selection, scroll budget, and totals.
 */
export default function PlaylistView(props: Readonly<PlaylistViewProps>) {
	const { maxRows, visibleSongs, selectedSong, totalCount } = props

	return (
		<PlaylistList
			songs={visibleSongs}
			selectedSong={selectedSong}
			inputTarget={InputTarget.Playlist}
			maxRows={maxRows}
			totalCount={totalCount}
			isFocused
		/>
	)
}
