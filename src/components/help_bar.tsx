import React from 'react'
import { Box, Text } from 'ink'

import { AppView } from '../types'

interface Hint {
	keys: string
	label: string
}

const LIBRARY_HINTS: Hint[] = [
	{ keys: '1/2/3/4/5', label: 'view' },
	{ keys: '↑↓/jk', label: 'nav' },
	{ keys: '←→/hl', label: 'column' },
	{ keys: 'space', label: '+playlist' },
	{ keys: 'g/G', label: 'top/bot' },
	{ keys: 'pgup/pgdn', label: 'page' },
	{ keys: 'enter/p', label: 'play' },
	{ keys: 's', label: 'stop' },
	{ keys: '+/-', label: 'vol' },
	{ keys: '/', label: 'search' },
	{ keys: 'c', label: 'clear' },
	{ keys: 'q', label: 'quit' }
]

const PLAYLIST_HINTS: Hint[] = [
	{ keys: '1/2/3/4/5', label: 'view' },
	{ keys: '↑↓/jk', label: 'nav' },
	{ keys: 'space', label: 'remove' },
	{ keys: 'c', label: 'clear playlist' },
	{ keys: 'g/G', label: 'top/bot' },
	{ keys: 'pgup/pgdn', label: 'page' },
	{ keys: 'enter/p', label: 'play' },
	{ keys: 's', label: 'stop' },
	{ keys: '+/-', label: 'vol' },
	{ keys: '/', label: 'search' },
	{ keys: 'q', label: 'quit' }
]

const NOW_PLAYING_HINTS: Hint[] = [
	{ keys: '1/2/3/4/5', label: 'view' },
	{ keys: 'enter/p/space', label: 'play' },
	{ keys: 's', label: 'stop' },
	{ keys: '+/-', label: 'vol' },
	{ keys: 'q', label: 'quit' }
]

/** Picks the hint set matching the currently active view. */
function hintsForView(appView: AppView): Hint[] {
	if (appView === AppView.Library) {
		return LIBRARY_HINTS
	}

	if (appView === AppView.Playlist) {
		return PLAYLIST_HINTS
	}

	return NOW_PLAYING_HINTS
}

export interface HelpBarProps {
	isSearching: boolean
	searchQuery: string
	appView: AppView
}

/**
 * Bottom help line displaying the current search buffer or context-aware key bindings.
 *
 * @param props - Active search state and current view, used to pick the appropriate hints.
 */
export default function HelpBar(props: Readonly<HelpBarProps>) {
	const { isSearching, searchQuery, appView } = props

	if (isSearching) {
		return (
			<Box paddingX={1}>
				<Text color="cyan">/</Text>
				<Text>{searchQuery}</Text>
				<Text color="cyan">█</Text>
				<Text dimColor>  </Text>
				<Text color="cyan">[enter]</Text>
				<Text dimColor> accept · </Text>
				<Text color="cyan">[esc]</Text>
				<Text dimColor> cancel</Text>
			</Box>
		)
	}

	const hints = hintsForView(appView)

	return (
		<Box paddingX={1}>
			<Text wrap="truncate-end">
				{hints.map((hint: Hint, index: number): React.ReactElement => (
					<Text key={hint.keys}>
						{index > 0 ? <Text dimColor> · </Text> : null}
						<Text color="cyan">[{hint.keys}]</Text>
						<Text dimColor> {hint.label}</Text>
					</Text>
				))}
			</Text>
		</Box>
	)
}
