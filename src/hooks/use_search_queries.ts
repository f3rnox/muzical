import { useCallback, useState } from "react";

import { InputTarget } from "../types";

export type SearchQueryMap = Record<InputTarget, string>;

export interface SearchQueriesApi {
	queries: SearchQueryMap;
	setQueryFor: (target: InputTarget, updater: (prev: string) => string) => void;
	clearQueryFor: (target: InputTarget) => void;
}

/**
 * Holds per-column search query strings and updaters used by the three-pane TUI filter UI.
 *
 * @returns Query map plus `setQueryFor` / `clearQueryFor` mutators keyed by {@link InputTarget}.
 */
export function useSearchQueries(): SearchQueriesApi {
	const [queries, setQueries] = useState<SearchQueryMap>({
		[InputTarget.Artist]: "",
		[InputTarget.Album]: "",
		[InputTarget.Song]: "",
		[InputTarget.Playlist]: "",
	});

	/** Applies a functional update to the query string for one list column. */
	const setQueryFor = useCallback(
		(target: InputTarget, updater: (prev: string) => string): void => {
			setQueries(
				(prev: SearchQueryMap): SearchQueryMap => ({
					...prev,
					[target]: updater(prev[target]),
				}),
			);
		},
		[],
	);

	/** Clears the filter text for a single column without affecting the others. */
	const clearQueryFor = useCallback((target: InputTarget): void => {
		setQueries(
			(prev: SearchQueryMap): SearchQueryMap => ({
				...prev,
				[target]: "",
			}),
		);
	}, []);

	return { queries, setQueryFor, clearQueryFor };
}
