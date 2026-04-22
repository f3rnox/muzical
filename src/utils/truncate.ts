const ELLIPSIS = '…'

/**
 * Shortens text to fit a column, appending an ellipsis when the string is longer than `maxLength`.
 *
 * @param text - Original label text.
 * @param maxLength - Maximum code units to return (may be only the ellipsis when very small).
 * @returns Truncated string, possibly ending with `…`.
 */
export function truncate (text: string, maxLength: number): string {
	if (maxLength <= 0) {
		return ''
	}
	if (text.length <= maxLength) {
		return text
	}
	if (maxLength <= ELLIPSIS.length) {
		return ELLIPSIS.slice(0, maxLength)
	}
	return text.slice(0, maxLength - ELLIPSIS.length) + ELLIPSIS
}
