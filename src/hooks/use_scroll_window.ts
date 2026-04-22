import { useMemo } from 'react'

export interface ScrollWindow {
	start: number
	end: number
}

export function useScrollWindow(
	itemCount: number,
	selectedIndex: number,
	maxVisible: number
): ScrollWindow {
	return useMemo((): ScrollWindow => {
		if (itemCount <= 0 || maxVisible <= 0) {
			return { start: 0, end: 0 }
		}

		const windowSize = Math.min(maxVisible, itemCount)
		const clampedIndex = Math.max(0, Math.min(selectedIndex, itemCount - 1))
		let start = Math.max(0, clampedIndex - Math.floor(windowSize / 2))
		let end = start + windowSize

		if (end > itemCount) {
			end = itemCount
			start = Math.max(0, end - windowSize)
		}

		return { start, end }
	}, [itemCount, selectedIndex, maxVisible])
}
