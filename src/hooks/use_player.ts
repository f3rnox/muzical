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

/**
 * Manages an external audio player subprocess: play, toggle pause/stop semantics, and lifecycle cleanup.
 *
 * @param options - Currently selected {@link PlayerCandidate} (or `null` when none).
 * @returns Playing state, timestamps, and `toggle` / `stop` controls for the TUI.
 */
export function usePlayer(options: Readonly<UsePlayerOptions>): PlayerApi {
	const { player } = options
	const [playingSong, setPlayingSong] = useState<LibrarySong | null>(null)
	const [playStartedAt, setPlayStartedAt] = useState<number | null>(null)
	const processRef = useRef<ChildProcess | null>(null)

	/** Terminates the active child process and clears listeners without updating React state. */
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

	/** Stops playback and clears the current song and elapsed timer state. */
	const stop = useCallback((): void => {
		killCurrent()
		setPlayingSong(null)
		setPlayStartedAt(null)
	}, [killCurrent])

	/** Spawns the configured player for `song`, replacing any existing playback. */
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

	/** Starts `song` when idle or switching tracks; stops when the same track is toggled again. */
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
