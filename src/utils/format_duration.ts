export function formatDuration(seconds: number | undefined): string {
	if (seconds === undefined || !Number.isFinite(seconds)) {
		return '--:--'
	}

	const total = Math.max(0, Math.floor(seconds))
	const hours = Math.floor(total / 3600)
	const minutes = Math.floor((total % 3600) / 60)
	const secs = total % 60
	const pad = (n: number): string => n.toString().padStart(2, '0')

	if (hours > 0) {
		return `${hours}:${pad(minutes)}:${pad(secs)}`
	}

	return `${minutes}:${pad(secs)}`
}
