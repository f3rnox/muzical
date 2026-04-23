import { describe, it } from 'mocha'
import { expect } from 'chai'

import { matchesQuery } from '../../src/utils/matches_query'

describe('matchesQuery', (): void => {
	it('returns true for an empty query regardless of value', (): void => {
		expect(matchesQuery('', '')).to.equal(true)
		expect(matchesQuery('anything', '')).to.equal(true)
	})

	it('matches case-insensitively', (): void => {
		expect(matchesQuery('Hello World', 'hello')).to.equal(true)
		expect(matchesQuery('hello world', 'HELLO')).to.equal(true)
		expect(matchesQuery('HELLO', 'hello')).to.equal(true)
	})

	it('matches a substring anywhere in the value', (): void => {
		expect(matchesQuery('The quick brown fox', 'quick')).to.equal(true)
		expect(matchesQuery('The quick brown fox', 'fox')).to.equal(true)
		expect(matchesQuery('The quick brown fox', 'The')).to.equal(true)
	})

	it('returns false when value does not contain the query', (): void => {
		expect(matchesQuery('hello', 'xyz')).to.equal(false)
		expect(matchesQuery('', 'hello')).to.equal(false)
	})
})
