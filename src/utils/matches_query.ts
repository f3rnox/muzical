/**
 * Case-insensitive substring filter used for in-TUI search across artist, album, and title fields.
 *
 * @param value - Field text to test (may be empty).
 * @param query - User search string; empty query matches everything.
 * @returns Whether `value` contains `query`, ignoring ASCII case.
 */
export function matchesQuery(value: string, query: string): boolean {
	if (query.length === 0) {
		return true
	}

	return value.toLowerCase().includes(query.toLowerCase())
}
