import { useEffect, useState } from 'react'

const TICK_MS = 500

function noop(): void {
	return
}

export function useElapsedSeconds(startedAt: number | null): number {
	const [now, setNow] = useState<number>((): number => Date.now())

	useEffect((): (() => void) => {
		if (startedAt === null) {
			return noop
		}

		setNow(Date.now())

		const id = setInterval((): void => {
			setNow(Date.now())
		}, TICK_MS)

		return (): void => {
			clearInterval(id)
		}
	}, [startedAt])

	if (startedAt === null) {
		return 0
	}

	return Math.max(0, (now - startedAt) / 1000)
}
