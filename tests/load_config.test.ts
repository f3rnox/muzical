import { describe, it, afterEach } from 'mocha'
import { expect } from 'chai'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'

import loadConfig from '../src/load_config'

const tempDirs: string[] = []

afterEach(async (): Promise<void> => {
	for (const dir of tempDirs.splice(0)) {
		await fs.rm(dir, { recursive: true, force: true })
	}
})

/**
 * Creates an isolated temporary directory registered for cleanup after the test.
 */
async function makeTempDir(): Promise<string> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'muzical-load-config-'))
	tempDirs.push(dir)
	return dir
}

/**
 * Writes a JSON config file at the supplied path and returns the path.
 */
async function writeConfigFile(dir: string, body: unknown): Promise<string> {
	const p = path.join(dir, 'config.json')
	await fs.writeFile(p, typeof body === 'string' ? body : JSON.stringify(body))
	return p
}

describe('loadConfig', (): void => {
	it('loads a valid config file and resolves musicDir to absolute', async (): Promise<void> => {
		const dir = await makeTempDir()
		const musicDir = path.join(dir, 'music')
		const configPath = await writeConfigFile(dir, {
			musicDir,
			songExtensions: ['mp3', '.flac']
		})

		const config = await loadConfig({ configPath })
		expect(config.musicDir).to.equal(path.resolve(musicDir))
		expect(config.songExtensions).to.deep.equal(['.mp3', '.flac'])
		expect(config.soulseekUsername).to.equal('')
		expect(config.soulseekPassword).to.equal('')
	})

	it('uses default song extensions when none are configured or overridden', async (): Promise<void> => {
		const dir = await makeTempDir()
		const configPath = await writeConfigFile(dir, { musicDir: '/music' })

		const config = await loadConfig({ configPath })
		expect(config.songExtensions).to.deep.equal(['.mp3', '.flac'])
	})

	it('prefers CLI overrides over config file values', async (): Promise<void> => {
		const dir = await makeTempDir()
		const configPath = await writeConfigFile(dir, {
			musicDir: '/from-config',
			songExtensions: ['.mp3'],
			soulseekUsername: 'alice',
			soulseekPassword: 'pw'
		})

		const config = await loadConfig({
			configPath,
			musicDir: '/from-cli',
			songExtensions: ['ogg'],
			soulseekUsername: 'bob',
			soulseekPassword: 'other'
		})

		expect(config.musicDir).to.equal(path.resolve('/from-cli'))
		expect(config.songExtensions).to.deep.equal(['.ogg'])
		expect(config.soulseekUsername).to.equal('bob')
		expect(config.soulseekPassword).to.equal('other')
	})

	it('throws when the config file contains invalid JSON', async (): Promise<void> => {
		const dir = await makeTempDir()
		const configPath = await writeConfigFile(dir, 'this is not json')

		try {
			await loadConfig({ configPath })
			expect.fail('expected loadConfig to reject')
		} catch (error: unknown) {
			expect(error).to.be.instanceOf(Error)
			expect((error as Error).message).to.match(/invalid JSON/i)
		}
	})

	it('throws when config is missing and no musicDir override is supplied', async (): Promise<void> => {
		const dir = await makeTempDir()
		const configPath = path.join(dir, 'does-not-exist.json')

		try {
			await loadConfig({ configPath })
			expect.fail('expected loadConfig to reject')
		} catch (error: unknown) {
			expect(error).to.be.instanceOf(Error)
			expect((error as Error).message).to.match(/Missing config file/i)
		}
	})

	it('accepts an override musicDir when no config file exists', async (): Promise<void> => {
		const dir = await makeTempDir()
		const configPath = path.join(dir, 'does-not-exist.json')

		const config = await loadConfig({
			configPath,
			musicDir: path.join(dir, 'songs')
		})
		expect(config.musicDir).to.equal(path.resolve(path.join(dir, 'songs')))
		expect(config.songExtensions).to.deep.equal(['.mp3', '.flac'])
	})

	it('throws when musicDir resolves to an empty string', async (): Promise<void> => {
		const dir = await makeTempDir()
		const configPath = await writeConfigFile(dir, { musicDir: '' })

		try {
			await loadConfig({ configPath })
			expect.fail('expected loadConfig to reject')
		} catch (error: unknown) {
			expect(error).to.be.instanceOf(Error)
			expect((error as Error).message).to.match(/No musicDir/i)
		}
	})

	it('normalizes extensions by adding a leading dot', async (): Promise<void> => {
		const dir = await makeTempDir()
		const configPath = await writeConfigFile(dir, {
			musicDir: '/m',
			songExtensions: ['mp3', 'flac', '.ogg']
		})

		const config = await loadConfig({ configPath })
		expect(config.songExtensions).to.deep.equal(['.mp3', '.flac', '.ogg'])
	})
})
