import { describe, it } from 'mocha'
import { expect } from 'chai'

import fitLabel from '../../src/utils/fit_label'

describe('fitLabel', (): void => {
	it('returns empty string when maxChars is zero or negative', (): void => {
		expect(fitLabel(0, 'hello')).to.equal('')
		expect(fitLabel(-1, 'hello')).to.equal('')
		expect(fitLabel(-100, 'hello')).to.equal('')
	})

	it('returns the full label when it fits within maxChars', (): void => {
		expect(fitLabel(10, 'hello')).to.equal('hello')
		expect(fitLabel(5, 'hello')).to.equal('hello')
	})

	it('returns only an ellipsis when maxChars is 1 and label longer', (): void => {
		expect(fitLabel(1, 'hello')).to.equal('…')
	})

	it('returns the label when maxChars is 1 and label fits', (): void => {
		expect(fitLabel(1, 'h')).to.equal('h')
		expect(fitLabel(1, '')).to.equal('')
	})

	it('truncates with a trailing ellipsis when label is too long', (): void => {
		expect(fitLabel(5, 'hello world')).to.equal('hell…')
		expect(fitLabel(6, 'hello world')).to.equal('hello…')
	})

	it('returns empty string when the label is empty regardless of maxChars', (): void => {
		expect(fitLabel(10, '')).to.equal('')
		expect(fitLabel(1, '')).to.equal('')
	})
})
