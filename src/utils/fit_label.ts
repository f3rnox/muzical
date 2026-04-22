/**
 * Truncates a string to `maxChars` code units, appending "…" when shorter than `label`.
 */
export default function fitLabel(maxChars: number, label: string): string {
	if (maxChars <= 0) {
		return ''
	}
	if (label.length <= maxChars) {
		return label
	}
	if (maxChars === 1) {
		return '…'
	}
	return `${label.slice(0, maxChars - 1)}…`
}
