import { describe, it } from 'mocha'
import { expect } from 'chai'

import { truncate } from '../../src/utils/truncate'

describe('truncate', (): void => {
	it('returns empty string when maxLength is zero or negative', (): void => {
		expect(truncate('hello', 0)).to.equal('')
		expect(truncate('hello', -5)).to.equal('')
	})

	it('returns the full text when it fits within maxLength', (): void => {
		expect(truncate('hello', 10)).to.equal('hello')
		expect(truncate('hello', 5)).to.equal('hello')
	})

	it('returns only the ellipsis when maxLength is 1 and text does not fit', (): void => {
		expect(truncate('hello', 1)).to.equal('…')
	})

	it('returns text unchanged when text length equals maxLength', (): void => {
		expect(truncate('abc', 3)).to.equal('abc')
	})

	it('truncates with trailing ellipsis when text is longer', (): void => {
		expect(truncate('hello world', 5)).to.equal('hell…')
		expect(truncate('hello world', 6)).to.equal('hello…')
	})

	it('handles empty text input', (): void => {
		expect(truncate('', 10)).to.equal('')
		expect(truncate('', 1)).to.equal('')
		expect(truncate('', 0)).to.equal('')
	})
})
