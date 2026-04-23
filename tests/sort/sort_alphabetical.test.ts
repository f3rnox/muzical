import { describe, it } from 'mocha'
import { expect } from 'chai'

import { sortAlphabetical } from '../../src/sort/sort_alphabetical'

describe('sortAlphabetical', (): void => {
	it('returns zero for identical strings', (): void => {
		expect(sortAlphabetical('abc', 'abc')).to.equal(0)
	})

	it('returns zero for the same string in different cases', (): void => {
		expect(sortAlphabetical('Abc', 'abc')).to.equal(0)
		expect(sortAlphabetical('HELLO', 'hello')).to.equal(0)
	})

	it('orders strings ascending ignoring case', (): void => {
		const arr = ['banana', 'Apple', 'cherry']
		arr.sort(sortAlphabetical)
		expect(arr).to.deep.equal(['Apple', 'banana', 'cherry'])
	})

	it('treats accented characters as base letters', (): void => {
		expect(sortAlphabetical('é', 'e')).to.equal(0)
	})
})
