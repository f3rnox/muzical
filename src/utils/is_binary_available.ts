import { spawnSync } from 'node:child_process'

export function isBinaryAvailable(bin: string): boolean {
	const locator = process.platform === 'win32' ? 'where' : 'which'
	const result = spawnSync(locator, [bin], { stdio: 'ignore' })

	return result.status === 0
}
