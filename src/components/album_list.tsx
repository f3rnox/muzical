import React from 'react'
import { Text } from 'ink'
import { TitledBox, titleStyles } from '@mishieck/ink-titled-box'

import { type LibraryAlbum } from './library_album'
import { InputTarget } from './input_target'
import { LIST_LABEL_MAX } from './list_label_max'
import { truncate } from '../truncate'

export interface AlbumListProps {
	albumsForSelectedArtist: LibraryAlbum[]
	selectedAlbum: LibraryAlbum | null
	inputTarget: InputTarget
}

export default function AlbumList(props: Readonly<AlbumListProps>) {
	const { albumsForSelectedArtist, selectedAlbum, inputTarget } = props

	return (
		<TitledBox titles={['Album']} titleStyles={titleStyles['hexagon']} flexShrink={0} flexGrow={1} flexDirection="column" borderStyle="round">
			{albumsForSelectedArtist.map(({ name }) => {
				const textProps: Record<string, string> = {}

				if (name === selectedAlbum?.name) {
					textProps['backgroundColor'] = inputTarget === InputTarget.Album ? 'white' : 'gray'
					textProps['color'] = inputTarget === InputTarget.Album ? 'black' : 'white'
				}

				return (
					<Text key={name} {...textProps}>{truncate(name, LIST_LABEL_MAX)}</Text>
				)
			})}
		</TitledBox>
	)
}
