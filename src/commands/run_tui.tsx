import React from 'react'
import { render } from 'ink'

import App from '../app'
import loadConfig, { type LoadConfigOptions, resolveConfigPath } from '../load_config'
import loadLibrary from '../load_library'
import loadMusicDir from '../load_music_dir'
import { resolvePlayer } from '../utils/resolve_player'
import { type PlayerName } from '../utils/player_candidates'

export interface RunTuiOptions extends LoadConfigOptions {
	player?: PlayerName | null
	clearScreen?: boolean
}

/**
 * Clears the screen (unless disabled), loads config and library, renders the Ink TUI, then restores the terminal.
 *
 * @param options - Config overrides, optional forced player, and clear-screen behavior.
 */
export async function runTui(options: Readonly<RunTuiOptions> = {}): Promise<void> {
	const clearScreen = options.clearScreen ?? true

	if (clearScreen) {
		console.clear()
	}

	try {
		const config = await loadConfig(options)
		const configPath = await resolveConfigPath(options.configPath)
		const { musicDir, songExtensions } = config
		const musicFiles = await loadMusicDir(musicDir, songExtensions)
		const library = await loadLibrary(musicFiles)
		const player = resolvePlayer(options.player ?? null)

		const { waitUntilExit } = render(
			<App
				config={config}
				configPath={configPath}
				library={library}
				player={player}
			/>
		)

		await waitUntilExit()
	} finally {
		if (clearScreen) {
			console.clear()
		}
	}
}
