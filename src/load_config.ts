import { promises as fs } from 'node:fs'
import path from 'node:path'

import envPaths from 'env-paths'

const DEFAULT_SONG_EXTENSIONS: string[] = ['.mp3', '.flac']

interface Config {
	musicDir: string
	songExtensions: string[]
	soulseekUsername: string
	soulseekPassword: string
}

export interface LoadConfigOptions {
	configPath?: string
	musicDir?: string
	songExtensions?: string[]
	soulseekUsername?: string
	soulseekPassword?: string
}

const CONFIG_FN = 'config.json'

/**
 * Resolves the absolute path to `config.json`, using an explicit override or the default app config directory.
 *
 * @param override - Optional user-provided `--config` path.
 * @returns Absolute path to the config file (parent directory is created when using the default location).
 */
const resolveConfigPath = async (override?: string): Promise<string> => {
	if (override !== undefined && override.length > 0) {
		return path.resolve(override)
	}

	const paths = envPaths('muzical', { suffix: '' })
	const { config: configDirPath } = paths

	try {
		await fs.access(configDirPath)
	} catch {
		await fs.mkdir(configDirPath, { recursive: true })
	}

	return path.join(configDirPath, CONFIG_FN)
}

/**
 * Ensures a song file extension string starts with `.`.
 *
 * @param ext - Extension with or without a leading dot.
 * @returns Normalized extension beginning with `.`.
 */
const normalizeExtension = (ext: string): string => (
	ext.startsWith('.') ? ext : `.${ext}`
)

/**
 * Loads `musicDir` and `songExtensions` from config and CLI overrides, with validation and path normalization.
 *
 * @param options - Optional config path, music directory, and extension list overrides.
 * @returns Resolved absolute music directory and normalized extensions.
 */
const loadConfig = async (options: Readonly<LoadConfigOptions> = {}): Promise<Config> => {
	const configPath = await resolveConfigPath(options.configPath)

	let fileMusicDir: string | undefined
	let fileExtensions: string[] | undefined
	let fileSoulseekUsername: string | undefined
	let fileSoulseekPassword: string | undefined

	try {
		await fs.access(configPath)
		const configJSON = await fs.readFile(configPath, 'utf-8')

		try {
			const data: {
				musicDir?: string
				songExtensions?: string[]
				soulseekUsername?: string
				soulseekPassword?: string
			} = JSON.parse(configJSON)
			fileMusicDir = data.musicDir
			fileExtensions = data.songExtensions
			fileSoulseekUsername = data.soulseekUsername
			fileSoulseekPassword = data.soulseekPassword
		} catch (error: unknown) {
			throw new Error('Config file contains invalid JSON', { cause: error })
		}
	} catch (error: unknown) {
		if (options.musicDir === undefined) {
			const err = error as NodeJS.ErrnoException

			if (err?.code === 'ENOENT') {
				throw new Error(
					`Missing config file at ${configPath}. Pass --music-dir to override.`
				)
			}

			throw error
		}
	}

	const musicDir = options.musicDir ?? fileMusicDir

	if (musicDir === undefined || musicDir.length === 0) {
		throw new Error('No musicDir configured. Set it in config.json or pass --music-dir.')
	}

	const extensions = options.songExtensions ?? fileExtensions ?? DEFAULT_SONG_EXTENSIONS

	return {
		musicDir: path.resolve(musicDir),
		songExtensions: extensions.map(normalizeExtension),
		soulseekUsername: options.soulseekUsername ?? fileSoulseekUsername ?? '',
		soulseekPassword: options.soulseekPassword ?? fileSoulseekPassword ?? ''
	}
}

export default loadConfig
export { Config, resolveConfigPath }
