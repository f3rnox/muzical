/**
 * Locale-aware, case-insensitive comparator for artist/album/title strings.
 *
 * @param a - First string.
 * @param b - Second string.
 * @returns Negative, zero, or positive per `String.prototype.localeCompare`.
 */
export function sortAlphabetical(a: string, b: string): number {
	return a.localeCompare(b, undefined, { sensitivity: 'base' })
}
