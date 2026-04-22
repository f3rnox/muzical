/**
 * Moves a list selection index by `delta`, clamping to `[0, length - 1]`; returns `-1` when the list is empty.
 *
 * @param length - Number of selectable items.
 * @param currentIndex - Current index, or `-1` when nothing is selected (treated as index `0` for movement).
 * @param delta - Change in index (negative for up/previous).
 * @returns The new clamped index, or `-1` if `length` is zero.
 */
export function clampIndex(
	length: number,
	currentIndex: number,
	delta: number
): number {
	if (length === 0) {
		return -1
	}

	const base = currentIndex === -1 ? 0 : currentIndex

	return Math.max(0, Math.min(length - 1, base + delta))
}
