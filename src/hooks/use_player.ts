import { useCallback, useEffect, useRef, useState } from 'react'
import { type ChildProcess, spawn } from 'node:child_process'

import { buildPlayerArgs } from '../utils/build_player_args'
import { type PlayerCandidate } from '../utils/player_candidates'
import { type LibrarySong } from '../types'

export interface UsePlayerOptions {
	player: PlayerCandidate | null
}

export interface PlayerApi {
	playingSong: LibrarySong | null
	playerName: string | null
	playStartedAt: number | null
	toggle: (song: LibrarySong | null) => void
	stop: () => void
}

export function usePlayer(options: Readonly<UsePlayerOptions>): PlayerApi {
	const { player } = options
	const [playingSong, setPlayingSong] = useState<LibrarySong | null>(null)
	const [playStartedAt, setPlayStartedAt] = useState<number | null>(null)
	const processRef = useRef<ChildProcess | null>(null)

	const killCurrent = useCallback((): void => {
		const proc = processRef.current

		if (proc === null) {
			return
		}

		proc.removeAllListeners('exit')
		proc.removeAllListeners('error')
		proc.kill('SIGTERM')
		processRef.current = null
	}, [])

	const stop = useCallback((): void => {
		killCurrent()
		setPlayingSong(null)
		setPlayStartedAt(null)
	}, [killCurrent])

	const play = useCallback((song: Readonly<LibrarySong>): void => {
		if (player === null) {
			return
		}

		killCurrent()

		const args = buildPlayerArgs(player, song.filePath)
		const proc = spawn(player.bin, args, { stdio: 'ignore' })

		processRef.current = proc
		setPlayingSong(song)
		setPlayStartedAt(Date.now())

		proc.once('exit', (): void => {
			if (processRef.current === proc) {
				processRef.current = null
				setPlayingSong(null)
				setPlayStartedAt(null)
			}
		})

		proc.once('error', (): void => {
			if (processRef.current === proc) {
				processRef.current = null
				setPlayingSong(null)
				setPlayStartedAt(null)
			}
		})
	}, [player, killCurrent])

	const toggle = useCallback((song: LibrarySong | null): void => {
		if (song === null) {
			return
		}

		if (playingSong?.filePath === song.filePath) {
			stop()

			return
		}

		play(song)
	}, [play, stop, playingSong])

	useEffect((): (() => void) => {
		return (): void => {
			killCurrent()
		}
	}, [killCurrent])

	return {
		playingSong,
		playerName: player?.name ?? null,
		playStartedAt,
		toggle,
		stop
	}
}
