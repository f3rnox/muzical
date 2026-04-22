import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

interface PackageJsonShape {
	version: string
}

/**
 * Reads `package.json` from a known relative location to report the CLI version string.
 *
 * @returns The semver `version` field, or `'0.0.0'` when the file cannot be read.
 */
export function getPackageVersion(): string {
	const here = path.dirname(fileURLToPath(import.meta.url))
	const candidates: string[] = [
		path.resolve(here, '..', '..', 'package.json'),
		path.resolve(here, '..', 'package.json')
	]

	for (const candidate of candidates) {
		try {
			const raw = readFileSync(candidate, 'utf-8')
			const parsed: PackageJsonShape = JSON.parse(raw)

			if (typeof parsed.version === 'string') {
				return parsed.version
			}
		} catch {
			continue
		}
	}

	return '0.0.0'
}
