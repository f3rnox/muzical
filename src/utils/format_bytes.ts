const UNITS: string[] = ['B', 'KB', 'MB', 'GB', 'TB']

/**
 * Formats a byte count as a short human-readable string like `4.3MB`.
 *
 * @param bytes - Byte count; accepts regular numbers or `bigint` (as returned by soulseek-ts).
 * @returns Compact string using binary-free (base-1024) units.
 */
export function formatBytes(bytes: number | bigint): string {
	const asNumber = typeof bytes === 'bigint' ? Number(bytes) : bytes

	if (!Number.isFinite(asNumber) || asNumber <= 0) {
		return '0B'
	}

	let value = asNumber
	let unitIndex = 0

	while (value >= 1024 && unitIndex < UNITS.length - 1) {
		value /= 1024
		unitIndex += 1
	}

	const fixed = value >= 100 || unitIndex === 0
		? value.toFixed(0)
		: value.toFixed(1)

	return `${fixed}${UNITS[unitIndex]}`
}
