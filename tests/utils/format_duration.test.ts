import { describe, it } from 'mocha'
import { expect } from 'chai'

import { formatDuration } from '../../src/utils/format_duration'

describe('formatDuration', (): void => {
	it('returns "--:--" when seconds is undefined', (): void => {
		expect(formatDuration(undefined)).to.equal('--:--')
	})

	it('returns "--:--" when seconds is non-finite', (): void => {
		expect(formatDuration(Number.NaN)).to.equal('--:--')
		expect(formatDuration(Number.POSITIVE_INFINITY)).to.equal('--:--')
		expect(formatDuration(Number.NEGATIVE_INFINITY)).to.equal('--:--')
	})

	it('clamps negative finite seconds to zero', (): void => {
		expect(formatDuration(-5)).to.equal('0:00')
		expect(formatDuration(-0.1)).to.equal('0:00')
	})

	it('formats M:SS for sub-hour durations', (): void => {
		expect(formatDuration(0)).to.equal('0:00')
		expect(formatDuration(5)).to.equal('0:05')
		expect(formatDuration(59)).to.equal('0:59')
		expect(formatDuration(60)).to.equal('1:00')
		expect(formatDuration(65)).to.equal('1:05')
		expect(formatDuration(3599)).to.equal('59:59')
	})

	it('formats H:MM:SS for durations >= 1 hour', (): void => {
		expect(formatDuration(3600)).to.equal('1:00:00')
		expect(formatDuration(3661)).to.equal('1:01:01')
		expect(formatDuration(3600 * 2 + 60 * 34 + 7)).to.equal('2:34:07')
	})

	it('floors fractional seconds', (): void => {
		expect(formatDuration(59.9)).to.equal('0:59')
		expect(formatDuration(65.4)).to.equal('1:05')
	})
})
