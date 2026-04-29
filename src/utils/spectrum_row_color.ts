export type SpectrumRowColor = "green" | "yellow" | "red";

/**
 * Picks a VU-meter style color for a spectrum row based on its vertical position.
 *
 * @param rowFromBottom - Zero-based row index measured from the bottom of the chart.
 * @param totalRows - Total number of rows in the chart.
 * @returns `'green'` near the floor, `'yellow'` in the middle band, `'red'` near the top.
 */
export function spectrumRowColor(
	rowFromBottom: number,
	totalRows: number,
): SpectrumRowColor {
	const t: number = totalRows <= 1 ? 0 : rowFromBottom / (totalRows - 1);

	if (t >= 0.8) {
		return "red";
	}

	if (t >= 0.5) {
		return "yellow";
	}

	return "green";
}
