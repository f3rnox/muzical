import { useEffect, useState } from 'react'
import { useStdout } from 'ink'

export interface TerminalSize {
	columns: number
	rows: number
}

export function useTerminalSize(): TerminalSize {
	const { stdout } = useStdout()
	const [size, setSize] = useState<TerminalSize>({
		columns: stdout.columns ?? 80,
		rows: stdout.rows ?? 24
	})

	useEffect((): (() => void) => {
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
