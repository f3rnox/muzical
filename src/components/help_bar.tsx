import React from 'react'
import { Box, Text } from 'ink'

export interface HelpBarProps {
	isSearching: boolean
	searchQuery: string
}

export default function HelpBar(props: Readonly<HelpBarProps>) {
	const { isSearching, searchQuery } = props

	if (isSearching) {
		return (
			<Box paddingX={1}>
				<Text color="cyan">/</Text>
				<Text>{searchQuery}</Text>
				<Text color="cyan">█</Text>
				<Text dimColor>  [enter] accept · [esc] cancel</Text>
			</Box>
		)
	}

	return (
		<Box paddingX={1}>
			<Text dimColor wrap="truncate-end">
				[↑↓/jk] nav · [←→/hl] column · [g/G] top/bot · [pgup/pgdn] page · [enter/p] play · [s] stop · [+/-] vol · [/] search · [c] clear · [q] quit
			</Text>
		</Box>
	)
}
