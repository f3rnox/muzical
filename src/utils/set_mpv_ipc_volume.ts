import { createConnection } from 'node:net'

/**
 * Tells a running `mpv` instance (the `--input-ipc-server=…` socket) to set the master volume 0–100.
 *
 * @param socketPath - Filesystem path to mpv’s unix IPC socket.
 * @param volume - Target volume, clamped to 0–100.
 */
export function setMpvIpcVolume(socketPath: string, volume: number): void {
	const clamped: number = Math.max(0, Math.min(100, Math.round(volume)))
	const line: string = JSON.stringify({ command: ['set_property', 'volume', clamped] }) + '\n'
	const client = createConnection(socketPath, (): void => {
		client.write(line, (): void => {
			client.end()
		})
	})
	client.once('error', (): void => {
		client.destroy()
	})
}
