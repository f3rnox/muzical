import React from 'react'
import { Box, Text } from 'ink'
import { TitledBox, titleStyles } from '@mishieck/ink-titled-box'

import { type LibrarySong, InputTarget } from '../types'
import { LIST_LABEL_MAX } from './list_label_max'
import { truncate } from '../utils/truncate'
import { useScrollWindow } from '../hooks/use_scroll_window'
import { formatDuration } from '../utils/format_duration'

export interface PlaylistListProps {
	songs: LibrarySong[]
	selectedSong: LibrarySong | null
	inputTarget: InputTarget
	maxRows: number
	totalCount: number
	isFocused: boolean
}

/**
 * Single-column playlist view listing queued songs with artist/title/duration.
 *
 * @param props - Filtered songs, current selection, scroll budget, and focus/highlight state.
 */
export default function PlaylistList(props: Readonly<PlaylistListProps>) {
	const { songs, selectedSong, maxRows, totalCount, isFocused } = props
	const selectedIndex = songs.findIndex((song: LibrarySong): boolean => (
		song.filePath === selectedSong?.filePath
	))
	const { start, end } = useScrollWindow(songs.length, selectedIndex, maxRows)
	const visible = songs.slice(start, end)
	const title = totalCount === songs.length
		? `Playlist ${songs.length}`
		: `Playlist ${songs.length}/${totalCount}`

	return (
		<TitledBox
			titles={[title]}
			titleStyles={titleStyles['hexagon']}
			flexGrow={1}
			flexShrink={1}
			flexBasis={0}
			flexDirection="column"
			borderStyle="round"
			borderColor={isFocused ? 'cyan' : 'gray'}
		>
			{start > 0 && <Text dimColor>  ↑ {start} more</Text>}
			{visible.map((song: LibrarySong, index: number): React.ReactElement => {
				const { metadata, filePath } = song
				const { common, format } = metadata
				const { title: songTitle, artist } = common
				const isSelected = filePath === selectedSong?.filePath
				const textProps: Record<string, string> = {}

				if (isSelected) {
					textProps['backgroundColor'] = isFocused ? 'cyan' : 'gray'
					textProps['color'] = isFocused ? 'black' : 'white'
				}

				const position = String(start + index + 1).padStart(3, ' ')
				const duration = formatDuration(format.duration)
				const label = truncate(
					`${artist ?? '(unknown)'} — ${songTitle ?? '(untitled)'}`,
					LIST_LABEL_MAX
				)
				const prefix = isSelected ? '▸ ' : '  '

				return (
					<Text key={`${filePath}-${start + index}`} wrap="truncate-end" {...textProps}>
						{`${prefix}${position}  ${label}  ${duration}`}
					</Text>
				)
			})}
			{end < songs.length && (
				<Text dimColor>  ↓ {songs.length - end} more</Text>
			)}
			{songs.length === 0 && (
				<Box paddingX={1}>
					<Text dimColor>playlist is empty — press [space] in library to add</Text>
				</Box>
			)}
		</TitledBox>
	)
}
