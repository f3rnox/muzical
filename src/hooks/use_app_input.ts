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
	/** Handles quit and app-view switching keys in normal mode. */
	const handleQuitAndViewSwitch = useCallback((input: string, key: Key): boolean => {
		if (key.escape || input === 'q') {
			exit()

			return true
		}

		if (input === '1') {
			setAppView(AppView.Library)

			return true
		}

		if (input === '2') {
			setAppView(AppView.Playlist)

			return true
		}

		if (input === '3') {
			setAppView(AppView.NowPlaying)

			return true
		}

		if (input === '4') {
			setAppView(AppView.Soulseek)

			return true
		}

		if (input === '5') {
			setAppView(AppView.Config)

			return true
		}

		return false
	}, [exit, setAppView])

	/** Handles playback-related keys and search activation in normal mode. */
	const handlePlaybackAndSearch = useCallback((input: string, key: Key): boolean => {
		if (input === ' ') {
			if (appView === AppView.Library) {
				addFocusedToPlaylist()
			} else if (appView === AppView.Playlist) {
				removeSelectedFromPlaylist()
			} else {
				togglePlayback()
			}

			return true
		}

		if (key.return || input === 'p') {
			togglePlayback()

			return true
		}

		if (input === 's') {
			stopPlayback()

			return true
		}

		if (input === '/' && appView !== AppView.NowPlaying) {
			setIsSearching(true)

			return true
		}

		return false
	}, [
		appView,
		setIsSearching,
		togglePlayback,
		stopPlayback,
		addFocusedToPlaylist,
		removeSelectedFromPlaylist
	])

	/** Handles horizontal column navigation in the library view. */
	const handleLibraryHorizontalNav = useCallback((input: string, key: Key): boolean => {
		if (appView !== AppView.Library) {
			return false
		}

		if (key.leftArrow || input === 'h') {
			focusPrevColumn()

			return true
		}

		if (key.rightArrow || input === 'l') {
			focusNextColumn()

			return true
		}

		return false
	}, [appView, focusPrevColumn, focusNextColumn])

	/** Handles vertical list movement and jump keys in normal mode. */
	const handleListMovement = useCallback((input: string, key: Key): boolean => {
		if (key.upArrow || input === 'k') {
			moveBy(-1)

			return true
		}

		if (key.downArrow || input === 'j') {
			moveBy(1)

			return true
		}

		if (key.pageUp) {
			moveBy(-listMaxRows)

			return true
		}

		if (key.pageDown) {
			moveBy(listMaxRows)

			return true
		}

		if (input === 'g') {
			jumpTo('start')

			return true
		}

		if (input === 'G') {
			jumpTo('end')

			return true
		}

		return false
	}, [listMaxRows, moveBy, jumpTo])

	/** Handles volume control and clear actions in normal mode. */
	const handleVolumeAndClear = useCallback((input: string): boolean => {
		if (input === '+' || input === '=') {
			adjustVolume(VOLUME_KEY_STEP)

			return true
		}

		if (input === '-') {
			adjustVolume(-VOLUME_KEY_STEP)

			return true
		}

		if (input === 'c') {
			if (appView === AppView.Playlist) {
				clearPlaylist()
			} else {
				clearQueryFor(inputTarget)
			}

			return true
		}

		return false
	}, [appView, inputTarget, adjustVolume, clearPlaylist, clearQueryFor])

	const handleNormal = useCallback((input: string, key: Key): void => {
		if (handleQuitAndViewSwitch(input, key)) {
			return
		}

		if (handlePlaybackAndSearch(input, key)) {
			return
		}

		if (handleLibraryHorizontalNav(input, key)) {
			return
		}

		if (handleListMovement(input, key)) {
			return
		}

		handleVolumeAndClear(input)
	}, [
		handleQuitAndViewSwitch,
		handlePlaybackAndSearch,
		handleLibraryHorizontalNav,
		handleListMovement,
		handleVolumeAndClear
	])

	useInput((input: string, key: Key): void => {
		if (appView === AppView.Config || appView === AppView.Soulseek) {
			return
		}

		if (isSearching) {
			handleSearching(input, key)

			return
		}

		handleNormal(input, key)
	})
}
