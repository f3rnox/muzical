import React from 'react'
import { Text } from 'ink'
import { TitledBox, titleStyles } from '@mishieck/ink-titled-box'

import { InputTarget } from './input_target'
import { LIST_LABEL_MAX } from './list_label_max'
import { truncate } from '../truncate'

export interface ArtistListProps {
	artistNames: string[]
	selectedArtist: string
	inputTarget: InputTarget
}

export default function ArtistList(props: Readonly<ArtistListProps>) {
	const { artistNames, selectedArtist, inputTarget } = props

	return (
		<TitledBox titles={['Artist']} titleStyles={titleStyles['hexagon']} flexGrow={1} flexDirection="column" borderStyle="round">
			{artistNames.map((artist: string) => {
				const textProps: Record<string, string> = {}

				if (artist === selectedArtist) {
					textProps['backgroundColor'] = inputTarget === InputTarget.Artist ? 'white' : 'gray'
					textProps['color'] = inputTarget === InputTarget.Artist ? 'black' : 'white'
				}

				return (
					<Text key={artist} {...textProps}>{truncate(artist, LIST_LABEL_MAX)}</Text>
				)
			})}
		</TitledBox>
	)
}
