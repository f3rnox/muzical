import { useCallback, useEffect, useRef, useState } from 'react'
import { type ChildProcess, spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { existsSync, unlinkSync } from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'

import { buildPlayerArgs } from '../utils/build_player_args'
import { type PlayerCandidate } from '../utils/player_candidates'
import { setMpvIpcVolume } from '../utils/set_mpv_ipc_volume'
import { type LibrarySong } from '../types'

export interface UsePlayerOptions {
	player: PlayerCandidate | null
}

export interface PlayerApi {
	playingSong: LibrarySong | null
	playerName: string | null
	playStartedAt: number | null
	volume: number
	adjustVolume: (delta: number) => void
	play: (song: Readonly<LibrarySong>) => void
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
	const [volume, setVolume] = useState<number>(100)
	const processRef = useRef<ChildProcess | null>(null)
	const mpvIpcPathRef = useRef<string | null>(null)

	/** Terminates the active child process and clears listeners without updating React state. */
	const killCurrent = useCallback((): void => {
		const proc = processRef.current
		const mpvIpc = mpvIpcPathRef.current
		mpvIpcPathRef.current = null
		processRef.current = null

		if (proc !== null) {
			proc.removeAllListeners('exit')
			proc.removeAllListeners('error')
			proc.kill('SIGTERM')
		}

		if (mpvIpc !== null) {
			try {
				if (existsSync(mpvIpc)) {
					unlinkSync(mpvIpc)
				}
			} catch {
				// ignore: still bound until exit
			}
		}
	}, [])

	/** Stops playback and clears the current song and elapsed timer state. */
	const stop = useCallback((): void => {
		killCurrent()
		setPlayingSong(null)
		setPlayStartedAt(null)
	}, [killCurrent])

	/** Nudges the master volume; live-updates a running `mpv` session when IPC is in use. */
	const adjustVolume = useCallback(
		(delta: number): void => {
			setVolume((prev: number) => {
				const next: number = Math.max(0, Math.min(100, Math.round(prev + delta)))

				if (player?.name === 'mpv' && processRef.current !== null && mpvIpcPathRef.current !== null) {
					setMpvIpcVolume(mpvIpcPathRef.current, next)
				}

				return next
			})
		},
		[player]
	)

	/** Spawns the configured player for `song`, replacing any existing playback. */
	const play = useCallback((song: Readonly<LibrarySong>): void => {
		if (player === null) {
			return
		}

		killCurrent()

		const mpvIpc: string | null
			= player.name === 'mpv'
				? path.join(
					os.tmpdir(),
					`muzical-mpv-${process.pid}-${randomBytes(8).toString('hex')}.socket`
				)
				: null

		mpvIpcPathRef.current = mpvIpc
		const thisMpvIpc: string | null = mpvIpc
		const args = buildPlayerArgs(player, song.filePath, {
			volume,
			...(mpvIpc === null ? {} : { mpvIpcPath: mpvIpc })
		})
		const proc = spawn(player.bin, args, { stdio: 'ignore' })

		processRef.current = proc
		setPlayingSong(song)
		setPlayStartedAt(Date.now())

		const onProcEnd = (): void => {
			if (thisMpvIpc !== null) {
				try {
					if (existsSync(thisMpvIpc)) {
						unlinkSync(thisMpvIpc)
					}
				} catch {
					// ignore
				}
			}
			if (processRef.current !== proc) {
				return
			}
			processRef.current = null
			if (thisMpvIpc !== null && mpvIpcPathRef.current === thisMpvIpc) {
				mpvIpcPathRef.current = null
			}
			setPlayingSong(null)
			setPlayStartedAt(null)
		}

		proc.once('exit', onProcEnd)
		proc.once('error', onProcEnd)
	}, [player, killCurrent, volume])

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
		volume,
		adjustVolume,
		play,
		toggle,
		stop
	}
}
