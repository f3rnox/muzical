import React, { useMemo } from 'react'
import { Box, Text } from 'ink'
import { TitledBox, titleStyles } from '@mishieck/ink-titled-box'

import { type LibrarySong } from '../types'
import { formatDuration } from '../utils/format_duration'
import { useElapsedSeconds } from '../hooks/use_elapsed_seconds'

const PROGRESS_FILLED = '█'
const PROGRESS_EMPTY = '░'
const PROGRESS_MIN_WIDTH = 10
const PROGRESS_INNER_MARGIN = 4

export interface NowPlayingViewProps {
	width: number
	playingSong: LibrarySong | null
	playerName: string | null
	playStartedAt: number | null
	volume: number
}

/**
 * Full-pane "now playing" readout with track metadata, a wide progress bar, and player state.
 *
 * @param props - Current playback target, elapsed-timer anchor, player name, and master volume.
 */
export default function NowPlayingView(props: Readonly<NowPlayingViewProps>) {
	const { width, playingSong, playerName, playStartedAt, volume } = props
	const elapsed = useElapsedSeconds(playStartedAt)

	const duration = playingSong?.metadata.format.duration ?? 0
	const clampedElapsed = duration > 0 ? Math.min(elapsed, duration) : elapsed
	const ratio = duration > 0
		? Math.max(0, Math.min(1, clampedElapsed / duration))
		: 0

	const progressWidth = Math.max(
		PROGRESS_MIN_WIDTH,
		width - PROGRESS_INNER_MARGIN * 2
	)

	const progressBar = useMemo((): string => {
		const filled = Math.round(progressWidth * ratio)
		const empty = progressWidth - filled
		return PROGRESS_FILLED.repeat(filled) + PROGRESS_EMPTY.repeat(empty)
	}, [progressWidth, ratio])

	const common = playingSong?.metadata.common
	const title = common?.title ?? '—'
	const artist = common?.artist ?? '—'
	const album = common?.album ?? '—'
	const year = common?.year
	const trackNo = common?.track?.no ?? null
	const trackOf = common?.track?.of ?? null
	const trackLabel = trackNo !== null
		? (trackOf !== null ? `${trackNo} / ${trackOf}` : String(trackNo))
		: '—'
	const albumLabel = year !== undefined ? `${album} (${year})` : album
	const timeLabel = `${formatDuration(clampedElapsed)} / ${formatDuration(duration)}`
	const stateLabel = playingSong === null
		? (playerName === null ? '⚠ no player detected' : `■ idle · ${playerName}`)
		: `▶ playing · ${playerName ?? 'unknown'}`
	const stateColor = playingSong === null
		? (playerName === null ? 'red' : 'gray')
		: 'green'

	return (
		<TitledBox
			titles={['Now Playing']}
			titleStyles={titleStyles['hexagon']}
			flexGrow={1}
			flexShrink={1}
			flexBasis={0}
			flexDirection="column"
			borderStyle="round"
			borderColor="cyan"
			paddingX={2}
			paddingY={1}
		>
			<Box flexDirection="column" marginBottom={1}>
				<Text bold color="green" wrap="truncate-end">{title}</Text>
				<Text wrap="truncate-end">
					<Text dimColor>by </Text>
					<Text color="magenta">{artist}</Text>
				</Text>
				<Text wrap="truncate-end">
					<Text dimColor>on </Text>
					<Text color="yellow">{albumLabel}</Text>
				</Text>
			</Box>
			<Box flexDirection="column" marginBottom={1}>
				<Text color="cyan">{progressBar}</Text>
				<Box justifyContent="space-between">
					<Text dimColor>{timeLabel}</Text>
					<Text dimColor>{`track ${trackLabel} · ${volume}% vol`}</Text>
				</Box>
			</Box>
			<Text color={stateColor}>{stateLabel}</Text>
		</TitledBox>
	)
}
