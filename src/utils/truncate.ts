const ELLIPSIS = '…'

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
