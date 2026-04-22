import React from 'react'
import { Text } from 'ink'
import { TitledBox, titleStyles } from '@mishieck/ink-titled-box'

import { type LibrarySong } from '../load_library'
import { InputTarget } from './input_target'
import { LIST_LABEL_MAX } from './list_label_max'
import { truncate } from '../truncate'

export interface SongListProps {
	songs: LibrarySong[]
	selectedSong: LibrarySong | null
	inputTarget: InputTarget
}

export default function SongList(props: Readonly<SongListProps>) {
	const { songs, selectedSong, inputTarget } = props

	return (
		<TitledBox titles={['Song']} titleStyles={titleStyles['hexagon']} flexShrink={0} flexGrow={1} flexDirection="column" borderStyle="round">
			{songs.map(({ metadata }) => {
				const { common } = metadata
				const { title } = common
				const textProps: Record<string, string> = {}

				if (title === selectedSong?.metadata.common.title) {
					textProps['backgroundColor'] = inputTarget === InputTarget.Song ? 'white' : 'gray'
					textProps['color'] = inputTarget === InputTarget.Song ? 'black' : 'white'
				}

				return (
					<Text key={title} {...textProps}>{truncate(title ?? '', LIST_LABEL_MAX)}</Text>
				)
			})}
		</TitledBox>
	)
}
