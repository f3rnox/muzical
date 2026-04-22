import React from 'react'
import { Box, Text } from 'ink'
import { TitledBox, titleStyles } from '@mishieck/ink-titled-box'

import { InputTarget } from '../types'
import { LIST_LABEL_MAX } from './list_label_max'
import { truncate } from '../utils/truncate'
import { useScrollWindow } from '../hooks/use_scroll_window'

export interface ArtistListProps {
	artistNames: string[]
	selectedArtist: string
	inputTarget: InputTarget
	maxRows: number
	totalCount: number
}

export default function ArtistList(props: Readonly<ArtistListProps>) {
	const { artistNames, selectedArtist, inputTarget, maxRows, totalCount } = props
	const isFocused = inputTarget === InputTarget.Artist
	const selectedIndex = artistNames.indexOf(selectedArtist)
	const { start, end } = useScrollWindow(artistNames.length, selectedIndex, maxRows)
	const visible = artistNames.slice(start, end)
	const title = totalCount === artistNames.length
		? `Artists ${artistNames.length}`
		: `Artists ${artistNames.length}/${totalCount}`

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
			{visible.map((artist: string): React.ReactElement => {
				const isSelected = artist === selectedArtist
				const textProps: Record<string, string> = {}

				if (isSelected) {
					textProps['backgroundColor'] = isFocused ? 'cyan' : 'gray'
					textProps['color'] = isFocused ? 'black' : 'white'
				}

				return (
					<Text key={artist} wrap="truncate-end" {...textProps}>
						{isSelected ? '▸ ' : '  '}
						{truncate(artist || '(unknown)', LIST_LABEL_MAX)}
					</Text>
				)
			})}
			{end < artistNames.length && (
				<Text dimColor>  ↓ {artistNames.length - end} more</Text>
			)}
			{artistNames.length === 0 && (
				<Box paddingX={1}>
					<Text dimColor>no matches</Text>
				</Box>
			)}
		</TitledBox>
	)
}
