import { useCallback, useState } from 'react'

import { InputTarget } from '../types'

export type SearchQueryMap = Record<InputTarget, string>

export interface SearchQueriesApi {
	queries: SearchQueryMap
	setQueryFor: (target: InputTarget, updater: (prev: string) => string) => void
	clearQueryFor: (target: InputTarget) => void
}

export function useSearchQueries(): SearchQueriesApi {
	const [queries, setQueries] = useState<SearchQueryMap>({
		[InputTarget.Artist]: '',
		[InputTarget.Album]: '',
		[InputTarget.Song]: ''
	})

	const setQueryFor = useCallback((
		target: InputTarget,
		updater: (prev: string) => string
	): void => {
		setQueries((prev: SearchQueryMap): SearchQueryMap => ({
			...prev,
			[target]: updater(prev[target])
		}))
	}, [])

	const clearQueryFor = useCallback((target: InputTarget): void => {
		setQueries((prev: SearchQueryMap): SearchQueryMap => ({
			...prev,
			[target]: ''
		}))
	}, [])

	return { queries, setQueryFor, clearQueryFor }
}
