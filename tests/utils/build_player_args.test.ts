import { describe, it } from 'mocha'
import { expect } from 'chai'

import { buildPlayerArgs } from '../../src/utils/build_player_args'
import { PLAYER_CANDIDATES, type PlayerCandidate, type PlayerName } from '../../src/utils/player_candidates'

/**
 * Looks up a PlayerCandidate by its name from the static list.
 */
function candidate(name: PlayerName): PlayerCandidate {
	const found = PLAYER_CANDIDATES.find(
		(entry: PlayerCandidate): boolean => entry.name === name
	)
	if (found === undefined) {
		throw new Error(`Missing test fixture for player ${name}`)
	}
	return found
}

describe('buildPlayerArgs', (): void => {
	describe('mpv', (): void => {
		it('appends --volume flag with default volume 100', (): void => {
			const args = buildPlayerArgs(candidate('mpv'), '/song.mp3')
			expect(args).to.include('--volume=100')
			expect(args).to.include('/song.mp3')
		})

		it('clamps volume to 0-100', (): void => {
			expect(
				buildPlayerArgs(candidate('mpv'), '/a', { volume: -10 })
			).to.include('--volume=0')
			expect(
				buildPlayerArgs(candidate('mpv'), '/a', { volume: 250 })
			).to.include('--volume=100')
		})

		it('appends --input-ipc-server only when mpvIpcPath is provided', (): void => {
			const withSocket = buildPlayerArgs(candidate('mpv'), '/a', {
				volume: 50,
				mpvIpcPath: '/tmp/mpv.sock'
			})
			expect(withSocket).to.include('--input-ipc-server=/tmp/mpv.sock')

			const without = buildPlayerArgs(candidate('mpv'), '/a', { volume: 50 })
			expect(without.some((arg: string): boolean => arg.startsWith('--input-ipc-server='))).to.equal(false)
		})

		it('places the file path after args and before suffixArgs', (): void => {
			const args = buildPlayerArgs(candidate('mpv'), '/song.mp3', { volume: 50 })
			expect(args[args.length - 1]).to.equal('/song.mp3')
		})
	})

	describe('mpg123', (): void => {
		it('uses -f scale of 256 at volume 100', (): void => {
			const args = buildPlayerArgs(candidate('mpg123'), '/song.mp3', { volume: 100 })
			expect(args).to.include('-f')
			expect(args).to.include('256')
		})

		it('scales 0..100 volume linearly into 0..256', (): void => {
			const args50 = buildPlayerArgs(candidate('mpg123'), '/song.mp3', { volume: 50 })
			const idx = args50.indexOf('-f')
			expect(args50[idx + 1]).to.equal('128')
		})

		it('clamps volume below 0 to scale 0', (): void => {
			const args = buildPlayerArgs(candidate('mpg123'), '/song.mp3', { volume: -20 })
			const idx = args.indexOf('-f')
			expect(args[idx + 1]).to.equal('0')
		})
	})

	describe('ffplay', (): void => {
		it('uses -af volume filter with decimal scaled 0..1', (): void => {
			const args = buildPlayerArgs(candidate('ffplay'), '/song.mp3', { volume: 50 })
			expect(args).to.include('-af')
			expect(args).to.include('volume=0.50')
		})

		it('full volume produces volume=1.00', (): void => {
			const args = buildPlayerArgs(candidate('ffplay'), '/song.mp3', { volume: 100 })
			expect(args).to.include('volume=1.00')
		})
	})

	describe('vlc', (): void => {
		it('appends the file path and the suffix quit URI', (): void => {
			const args = buildPlayerArgs(candidate('vlc'), '/song.mp3')
			const fileIdx = args.indexOf('/song.mp3')
			expect(fileIdx).to.be.greaterThan(-1)
			expect(args[args.length - 1]).to.equal('vlc://quit')
		})
	})
})
