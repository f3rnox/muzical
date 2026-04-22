import { useCallback } from 'react'
import { type Key, useInput } from 'ink'

import { InputTarget } from '../types'

export type JumpPosition = 'start' | 'end'

export interface AppInputHandlers {
	inputTarget: InputTarget
	isSearching: boolean
	listMaxRows: number
	exit: () => void
	setIsSearching: (value: boolean) => void
	setQueryFor: (target: InputTarget, updater: (prev: string) => string) => void
	clearQueryFor: (target: InputTarget) => void
	moveBy: (delta: number) => void
	jumpTo: (position: JumpPosition) => void
	focusPrevColumn: () => void
	focusNextColumn: () => void
	togglePlayback: () => void
	stopPlayback: () => void
}

export function useAppInput(handlers: Readonly<AppInputHandlers>): void {
	const {
		inputTarget,
		isSearching,
		listMaxRows,
		exit,
		setIsSearching,
		setQueryFor,
		clearQueryFor,
		moveBy,
		jumpTo,
		focusPrevColumn,
		focusNextColumn,
		togglePlayback,
		stopPlayback
	} = handlers

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

	const handleNormal = useCallback((input: string, key: Key): void => {
		if (key.escape) {
			exit()

			return
		}

		if (input === 'q') {
			exit()

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

		if (input === '/') {
			setIsSearching(true)

			return
		}

		if (key.leftArrow || input === 'h') {
			focusPrevColumn()

			return
		}

		if (key.rightArrow || input === 'l') {
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

		if (input === 'c') {
			clearQueryFor(inputTarget)
		}
	}, [
		inputTarget,
		listMaxRows,
		exit,
		setIsSearching,
		clearQueryFor,
		moveBy,
		jumpTo,
		focusPrevColumn,
		focusNextColumn,
		togglePlayback,
		stopPlayback
	])

	useInput((input: string, key: Key): void => {
		if (isSearching) {
			handleSearching(input, key)

			return
		}

		handleNormal(input, key)
	})
}
