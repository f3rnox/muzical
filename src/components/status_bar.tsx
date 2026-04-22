import React, { useMemo } from 'react'
import { Box, Text } from 'ink'

import { type LibrarySong, type LibraryAlbum } from '../types'
import { formatDuration } from '../utils/format_duration'

/** Round border (2) + paddingX (2). */
const STATUS_INNER_OFFSET = 4
const BREADCRUMB_MIN_WIDTH = 6

export interface StatusBarProps {
	width: number
	totalSongs: number
	totalArtists: number
	totalAlbums: number
	selectedArtist: string
	selectedAlbum: LibraryAlbum | null
	selectedSong: LibrarySong | null
}

/**
 * Top status row: library counts, breadcrumb of the current artist/album/title, and formatted duration.
 *
 * @param props - Layout width and the currently highlighted entities from the browser state.
 */
export default function StatusBar(props: Readonly<StatusBarProps>) {
	const {
		width,
		totalSongs,
		totalArtists,
		totalAlbums,
		selectedArtist,
		selectedAlbum,
		selectedSong
	} = props

	const title = selectedSong?.metadata.common.title ?? '—'
	const duration = formatDuration(selectedSong?.metadata.format.duration)
	const albumName = selectedAlbum?.name ?? '—'
	const artistName = selectedArtist || '—'

	const statsText = useMemo((): string => (
		`${totalArtists} artists · ${totalAlbums} albums · ${totalSongs} songs`
	), [totalArtists, totalAlbums, totalSongs])

	const breadcrumbWidth = useMemo((): number => {
		const inner = Math.max(0, width - STATUS_INNER_OFFSET)
		const leftWidth = 'muzical '.length + statsText.length + 1
		return Math.max(BREADCRUMB_MIN_WIDTH, inner - leftWidth)
	}, [width, statsText])

	return (
		<Box
			borderStyle="round"
			borderColor="gray"
			paddingX={1}
			flexDirection="row"
			justifyContent="space-between"
		>
			<Box>
				<Text bold color="cyan">muzical </Text>
				<Text dimColor>{statsText}</Text>
			</Box>
			<Box flexShrink={1} width={breadcrumbWidth}>
				<Text wrap="truncate-start">
					<Text color="magenta">{artistName}</Text>
					<Text dimColor> › </Text>
					<Text color="yellow">{albumName}</Text>
					<Text dimColor> › </Text>
					<Text color="green">{title}</Text>
					<Text dimColor> ({duration})</Text>
				</Text>
			</Box>
		</Box>
	)
}
