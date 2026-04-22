import { useEffect, useState } from 'react'
import { useStdout } from 'ink'

export interface TerminalSize {
	columns: number
	rows: number
}

/**
 * Subscribes to stdout `resize` events and exposes the current terminal column/row counts for layout.
 *
 * @returns Latest `{ columns, rows }` from Ink's stdout handle with sensible fallbacks.
 */
export function useTerminalSize(): TerminalSize {
	const { stdout } = useStdout()
	const [size, setSize] = useState<TerminalSize>({
		columns: stdout.columns ?? 80,
		rows: stdout.rows ?? 24
	})

	useEffect((): (() => void) => {
		/** Pushes the current stdout dimensions into React state. */
		const onResize = (): void => {
			setSize({
				columns: stdout.columns ?? 80,
				rows: stdout.rows ?? 24
			})
		}

		stdout.on('resize', onResize)

		return (): void => {
			stdout.off('resize', onResize)
		}
	}, [stdout])

	return size
}
