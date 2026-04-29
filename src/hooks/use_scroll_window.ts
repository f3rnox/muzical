import { useMemo } from "react";

export interface ScrollWindow {
	start: number;
	end: number;
}

/**
 * Computes a centered (then edge-clamped) slice window over a long list given the selected index.
 *
 * @param itemCount - Total rows in the list.
 * @param selectedIndex - Currently selected row index (may be `-1` when empty selection).
 * @param maxVisible - Maximum number of rows to render at once.
 * @returns Inclusive `[start, end)` slice bounds for `Array.prototype.slice`.
 */
export function useScrollWindow(
	itemCount: number,
	selectedIndex: number,
	maxVisible: number,
): ScrollWindow {
	return useMemo((): ScrollWindow => {
		if (itemCount <= 0 || maxVisible <= 0) {
			return { start: 0, end: 0 };
		}

		const windowSize = Math.min(maxVisible, itemCount);
		const clampedIndex = Math.max(0, Math.min(selectedIndex, itemCount - 1));
		let start = Math.max(0, clampedIndex - Math.floor(windowSize / 2));
		let end = start + windowSize;

		if (end > itemCount) {
			end = itemCount;
			start = Math.max(0, end - windowSize);
		}

		return { start, end };
	}, [itemCount, selectedIndex, maxVisible]);
}
