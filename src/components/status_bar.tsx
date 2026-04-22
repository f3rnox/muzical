import React, { useMemo } from 'react'
import { Box, Text } from 'ink'

import { type LibrarySong, type LibraryAlbum } from '../types'
import { formatDuration } from '../utils/format_duration'
import fitLabel from '../utils/fit_label'

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
	playingSong: LibrarySong | null
	playerName: string | null
}

export default function StatusBar(props: Readonly<StatusBarProps>) {
	const {
		width,
		totalSongs,
		totalArtists,
		totalAlbums,
		selectedArtist,
		selectedAlbum,
		selectedSong,
		playingSong,
		playerName
	} = props

	const title = selectedSong?.metadata.common.title ?? '—'
	const duration = formatDuration(selectedSong?.metadata.format.duration)
	const albumName = selectedAlbum?.name ?? '—'
	const artistName = selectedArtist || '—'
	const playingTitle = playingSong?.metadata.common.title ?? ''
	let playbackLabel: string
	if (playingSong) {
		playbackLabel = `▶ ${playingTitle}`
	} else if (playerName === null) {
		playbackLabel = '⚠ no player'
	} else {
		playbackLabel = `■ ${playerName}`
	}

	let playbackTextColor: 'green' | 'gray' | 'red'
	if (playingSong) {
		playbackTextColor = 'green'
	} else if (playerName === null) {
		playbackTextColor = 'red'
	} else {
		playbackTextColor = 'gray'
	}

	const statsText = useMemo((): string => (
		`${totalArtists} artists · ${totalAlbums} albums · ${totalSongs} songs`
	), [totalArtists, totalAlbums, totalSongs])

	const leftLayout = useMemo((): {
		showStats: boolean
		playbackDisplay: string
		breadcrumbWidth: number
	} => {
		const inner = Math.max(0, width - STATUS_INNER_OFFSET)
		const minRight = BREADCRUMB_MIN_WIDTH
		const leftPrefix = (includeStats: boolean): number => (
			8 + (includeStats ? statsText.length : 0) + 1
		)
		// 1) Stats + as much of playback as fits; 2) without stats; 3) fit playback again
		const tryLayout = (includeStats: boolean): { showStats: boolean; play: string } => {
			const prefix = leftPrefix(includeStats)
			const maxPlay = Math.max(0, inner - prefix - minRight)
			return {
				showStats: includeStats,
				play: maxPlay < playbackLabel.length
					? fitLabel(maxPlay, playbackLabel)
					: playbackLabel
			}
		}

		let t = tryLayout(true)
		const used = (a: { showStats: boolean; play: string }): number => (
			leftPrefix(a.showStats) + a.play.length
		)
		if (used(t) + minRight > inner) {
			t = tryLayout(false)
		}
		if (used(t) + minRight > inner) {
			t = { showStats: false, play: fitLabel(Math.max(0, inner - leftPrefix(false) - minRight), playbackLabel) }
		}
		const w = Math.max(1, inner - used(t))
		return { showStats: t.showStats, playbackDisplay: t.play, breadcrumbWidth: w }
	}, [width, statsText, playbackLabel])

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
				{leftLayout.showStats
					? (
						<Text dimColor>
							{statsText}
						</Text>
					)
					: null}
				<Text> </Text>
				<Text color={playbackTextColor}>
					{leftLayout.playbackDisplay}
				</Text>
			</Box>
			<Box flexShrink={1} width={leftLayout.breadcrumbWidth}>
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
