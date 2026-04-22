export function matchesQuery(value: string, query: string): boolean {
	if (query.length === 0) {
		return true
	}

	return value.toLowerCase().includes(query.toLowerCase())
}
