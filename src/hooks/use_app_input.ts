import { useCallback } from 'react'
import { type Key, useInput } from 'ink'

import { AppView, InputTarget } from '../types'

export type JumpPosition = 'start' | 'end'

const VOLUME_KEY_STEP = 5

export interface AppInputHandlers {
	appView: AppView
	inputTarget: InputTarget
	isSearching: boolean
	listMaxRows: number
	exit: () => void
	setIsSearching: (value: boolean) => void
	setAppView: (view: AppView) => void
	setQueryFor: (target: InputTarget, updater: (prev: string) => string) => void
	clearQueryFor: (target: InputTarget) => void
	moveBy: (delta: number) => void
	jumpTo: (position: JumpPosition) => void
	focusPrevColumn: () => void
	focusNextColumn: () => void
	togglePlayback: () => void
	stopPlayback: () => void
	adjustVolume: (delta: number) => void
	addFocusedToPlaylist: () => void
	removeSelectedFromPlaylist: () => void
	clearPlaylist: () => void
}

/**
 * Wires Ink keyboard handling for search mode vs normal navigation, delegating to the provided callbacks.
 *
 * @param handlers - Current focus, search state, and motion/playback actions from the app shell.
 */
export function useAppInput(handlers: Readonly<AppInputHandlers>): void {
	const {
		appView,
		inputTarget,
		isSearching,
		listMaxRows,
		exit,
		setIsSearching,
		setAppView,
		setQueryFor,
		clearQueryFor,
		moveBy,
		jumpTo,
		focusPrevColumn,
		focusNextColumn,
		togglePlayback,
		stopPlayback,
		adjustVolume,
		addFocusedToPlaylist,
		removeSelectedFromPlaylist,
		clearPlaylist
	} = handlers

	/** Handles keystrokes while the user is typing a filter query (`/` search mode). */
	const handleSearching = useCallback((input: string, key: Key): void => {
		if (key.escape) {
			clearQueryFor(inputTarget)
			setIsSearching(false)

			return
		}

		if (key.return) {
			setIsSearching(false)

			return
		}

		if (key.backspace || key.delete) {
			setQueryFor(inputTarget, (prev: string): string => prev.slice(0, -1))

			return
		}

		if (key.upArrow) {
			moveBy(-1)

			return
		}

		if (key.downArrow) {
			moveBy(1)

			return
		}

		if (input.length > 0 && !key.ctrl && !key.meta) {
			setQueryFor(inputTarget, (prev: string): string => prev + input)
		}
	}, [inputTarget, clearQueryFor, setIsSearching, setQueryFor, moveBy])

	/** Handles navigation, column focus, playback, and quit when not in search mode. */
	const handleNormal = useCallback((input: string, key: Key): void => {
		if (key.escape) {
			exit()

			return
		}

		if (input === 'q') {
			exit()

			return
		}

		if (input === '1') {
			setAppView(AppView.Library)

			return
		}

		if (input === '2') {
			setAppView(AppView.Playlist)

			return
		}

		if (input === '3') {
			setAppView(AppView.NowPlaying)

			return
		}

		if (input === '4') {
			setAppView(AppView.Config)

			return
		}

		if (input === ' ') {
			if (appView === AppView.Library) {
				addFocusedToPlaylist()
			} else if (appView === AppView.Playlist) {
				removeSelectedFromPlaylist()
			} else {
				togglePlayback()
			}

			return
		}

		if (key.return || input === 'p') {
			togglePlayback()

			return
		}

		if (input === 's') {
			stopPlayback()

			return
		}

		if (input === '/' && appView !== AppView.NowPlaying) {
			setIsSearching(true)

			return
		}

		if (appView === AppView.Library && (key.leftArrow || input === 'h')) {
			focusPrevColumn()

			return
		}

		if (appView === AppView.Library && (key.rightArrow || input === 'l')) {
			focusNextColumn()

			return
		}

		if (key.upArrow || input === 'k') {
			moveBy(-1)

			return
		}

		if (key.downArrow || input === 'j') {
			moveBy(1)

			return
		}

		if (key.pageUp) {
			moveBy(-listMaxRows)

			return
		}

		if (key.pageDown) {
			moveBy(listMaxRows)

			return
		}

		if (input === 'g') {
			jumpTo('start')

			return
		}

		if (input === 'G') {
			jumpTo('end')

			return
		}

		if (input === '+' || input === '=') {
			adjustVolume(VOLUME_KEY_STEP)

			return
		}

		if (input === '-') {
			adjustVolume(-VOLUME_KEY_STEP)

			return
		}

		if (input === 'c') {
			if (appView === AppView.Playlist) {
				clearPlaylist()
			} else {
				clearQueryFor(inputTarget)
			}
		}
	}, [
		appView,
		inputTarget,
		listMaxRows,
		exit,
		setIsSearching,
		setAppView,
		clearQueryFor,
		moveBy,
		jumpTo,
		focusPrevColumn,
		focusNextColumn,
		togglePlayback,
		stopPlayback,
		adjustVolume,
		addFocusedToPlaylist,
		removeSelectedFromPlaylist,
		clearPlaylist
	])

	useInput((input: string, key: Key): void => {
		if (appView === AppView.Config) {
			return
		}

		if (isSearching) {
			handleSearching(input, key)

			return
		}

		handleNormal(input, key)
	})
}
