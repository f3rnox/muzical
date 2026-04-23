import { describe, it } from 'mocha'
import { expect } from 'chai'

import { isBinaryAvailable } from '../../src/utils/is_binary_available'

describe('isBinaryAvailable', (): void => {
	it('returns true for a binary that definitely exists on PATH', (): void => {
		const probe = process.platform === 'win32' ? 'cmd' : 'sh'
		expect(isBinaryAvailable(probe)).to.equal(true)
	})

	it('returns false for a binary that should never exist', (): void => {
		expect(isBinaryAvailable('muzical_nonexistent_binary_xyz_123')).to.equal(false)
	})
})
