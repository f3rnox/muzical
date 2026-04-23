const PARTIAL_BLOCKS: readonly string[] = [' ', '▁', '▂', '▃', '▄', '▅', '▆', '▇']
const FULL_BLOCK = '█'

/**
 * Resolves the unicode block character for a single vertical cell of a spectrum bar.
 *
 * @param cellIndex - Zero-based row index measured from the bottom of the bar.
 * @param heightEighths - Bar height expressed in eighths of a row (0..rows*8).
 * @returns The glyph to render at this cell (`█`, a partial block, or `' '`).
 */
export function spectrumCellChar(cellIndex: number, heightEighths: number): string {
	const fullCells: number = Math.floor(heightEighths / 8)
	const remainder: number = heightEighths % 8

	if (cellIndex < fullCells) {
		return FULL_BLOCK
	}

	if (cellIndex === fullCells) {
		return PARTIAL_BLOCKS[remainder] ?? ' '
	}

	return ' '
}
