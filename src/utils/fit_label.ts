/**
 * Truncates a label to at most `maxChars` code units, reserving one character for an ellipsis when needed.
 *
 * @param maxChars - Maximum width of the returned string.
 * @param label - Full text to fit in the UI.
 * @returns Either the full label, a shortened label with `…`, or empty when `maxChars` is non-positive.
 */
export default function fitLabel(maxChars: number, label: string): string {
	if (maxChars <= 0) {
		return "";
	}
	if (label.length <= maxChars) {
		return label;
	}
	if (maxChars === 1) {
		return "…";
	}
	return `${label.slice(0, maxChars - 1)}…`;
}
