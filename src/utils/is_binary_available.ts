import { spawnSync } from 'node:child_process'

/**
 * Checks whether an executable name resolves on the host (`which` / `where` exit 0).
 *
 * @param bin - Program name as invoked on the shell (no directory path required).
 * @returns `true` when the locator command succeeds.
 */
export function isBinaryAvailable(bin: string): boolean {
	const locator = process.platform === 'win32' ? 'where' : 'which'
	const result = spawnSync(locator, [bin], { stdio: 'ignore' })

	return result.status === 0
}
