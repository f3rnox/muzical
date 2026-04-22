import { promises as fs } from 'node:fs'
import path from 'node:path'

import envPaths from 'env-paths'

interface Config {
	musicDir: string
}

const CONFIG_FN = 'config.json'

const loadConfig = async (): Promise<Config> => {
	const paths = envPaths('muzical', {
		suffix: ''
	})

	const { config: configDirPath } = paths

	try {
		await fs.access(configDirPath)
	} catch {
		await fs.mkdir(configDirPath, { recursive: true })
	}

	const configPath = path.join(configDirPath, CONFIG_FN)

	try {
		await fs.access(configPath)
	} catch {
		console.error(`Missing config file at ${configPath}`)
		process.exit(1)
	}

	const configJSON = await fs.readFile(configPath, 'utf-8')

	try {
		return JSON.parse(configJSON)
	} catch (error: unknown) {
		throw new Error('Config file contains invalid JSON', { cause: error })
	}
}

export default loadConfig
export { Config }
