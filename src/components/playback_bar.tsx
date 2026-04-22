import React, { useMemo } from 'react'
import { Box, Text } from 'ink'

import { type LibrarySong } from '../types'
import { formatDuration } from '../utils/format_duration'
import fitLabel from '../utils/fit_label'
import { useElapsedSeconds } from '../hooks/use_elapsed_seconds'

/** Round border (2) + paddingX (2). */
const BAR_INNER_OFFSET = 4
const MIN_PROGRESS_WIDTH = 6
const MAX_TITLE_WIDTH = 48
const PROGRESS_FILLED = '█'
const PROGRESS_EMPTY = '░'

export interface PlaybackBarProps {
	width: number
	playingSong: LibrarySong | null
	playerName: string | null
	playStartedAt: number | null
}

export default function PlaybackBar(props: Readonly<PlaybackBarProps>) {
	const { width, playingSong, playerName, playStartedAt } = props
	const elapsed = useElapsedSeconds(playStartedAt)

	const duration = playingSong?.metadata.format.duration ?? 0
	const clampedElapsed = duration > 0
		? Math.min(elapsed, duration)
		: elapsed
	const elapsedLabel = formatDuration(clampedElapsed)
	const durationLabel = formatDuration(
		playingSong?.metadata.format.duration
	)
	const timeLabel = `${elapsedLabel} / ${durationLabel}`

	const title = playingSong?.metadata.common.title ?? ''
	const ratio = duration > 0
		? Math.max(0, Math.min(1, clampedElapsed / duration))
		: 0

	const inner = Math.max(0, width - BAR_INNER_OFFSET)

	const layout = useMemo((): {
		icon: string
		iconColor: 'green' | 'gray' | 'red'
		titleText: string
		showProgress: boolean
		progressWidth: number
		timeText: string
		idleText: string | null
	} => {
		if (playingSong === null) {
			const idleText = playerName === null
				? '⚠ no player detected'
				: `■ idle · ${playerName}`
			return {
				icon: playerName === null ? '⚠' : '■',
				iconColor: playerName === null ? 'red' : 'gray',
				titleText: '',
				showProgress: false,
				progressWidth: 0,
				timeText: '',
				idleText
			}
		}

		const icon = '▶'
		const iconColor = 'green' as const
		const timeText = timeLabel
		const gap = 2
		const iconWidth = icon.length + 1
		const titleCap = Math.min(MAX_TITLE_WIDTH, Math.max(0, inner - iconWidth - gap - MIN_PROGRESS_WIDTH - gap - timeText.length))
		const titleText = fitLabel(titleCap, title)
		const used = iconWidth + titleText.length + gap + gap + timeText.length
		const progressWidth = Math.max(0, inner - used)
		const showProgress = progressWidth >= MIN_PROGRESS_WIDTH

		return {
			icon,
			iconColor,
			titleText,
			showProgress,
			progressWidth: showProgress ? progressWidth : 0,
			timeText,
			idleText: null
		}
	}, [playingSong, playerName, title, timeLabel, inner])

	const progressBar = useMemo((): string => {
		if (!layout.showProgress || layout.progressWidth <= 0) {
			return ''
		}

		const filled = Math.round(layout.progressWidth * ratio)
		const empty = layout.progressWidth - filled
		return PROGRESS_FILLED.repeat(filled) + PROGRESS_EMPTY.repeat(empty)
	}, [layout.showProgress, layout.progressWidth, ratio])

	return (
		<Box
			borderStyle="round"
			borderColor="gray"
			paddingX={1}
			flexDirection="row"
		>
			{layout.idleText === null
				? (
					<Box flexDirection="row" width={inner}>
						<Text color={layout.iconColor}>{layout.icon} </Text>
						<Text color="green">{layout.titleText}</Text>
						{layout.showProgress
							? (
								<>
									<Text>  </Text>
									<Text color="cyan">{progressBar}</Text>
								</>
							)
							: null}
						<Text>  </Text>
						<Text dimColor>{layout.timeText}</Text>
					</Box>
				)
				: (
					<Text color={layout.iconColor}>{layout.idleText}</Text>
				)}
		</Box>
	)
}
