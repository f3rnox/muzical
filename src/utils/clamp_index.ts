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
