#!/usr/bin/env node

import React from 'react'
import { render } from 'ink'
import App from './app'
import loadConfig from './load_config'
import loadMusicDir from './load_music_dir'
import loadLibrary from './load_library'

const run = async () => {
	console.clear()
	try {
		const config = await loadConfig()
		const { musicDir, songExtensions } = config
		const musicFiles = await loadMusicDir(musicDir, songExtensions)
		const library = await loadLibrary(musicFiles)

		const { waitUntilExit } = render(<App config={config} library={library} />)
		await waitUntilExit()
	} finally {
		console.clear()
	}
}

run().catch((err: Error): void => {
	console.error(err.message)
})
