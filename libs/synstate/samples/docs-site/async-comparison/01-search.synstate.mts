import {
  createScope,
  createState,
  debounce,
  fromAbortablePromise,
  just,
  map,
  switchMap,
  withInitialValue,
  type Observable,
} from 'synstate';
import { Result } from 'ts-data-forge';
import {
  debounceMs,
  fetchItems,
  idleState,
  toErrorMessage,
  type SearchState,
} from './00-search-api.mjs';
import { testSearch } from './search-test-suite.mjs';

// embed-sample-code-ignore-above
export const createSearch = () => {
  // Everything created inside `run` is torn down by `scope.dispose()`.
  // A search box that lives as long as the page can skip the scope.
  const scope = createScope();

  return scope.run(() => {
    const [query, setQuery] = createState('');

    const searchState = query
      .pipe(debounce(debounceMs)) // wait for typing to pause
      .pipe(map((q) => q.trim())) // map passes on only a changed query
      .pipe(
        // A newer query completes the previous inner observable,
        // and completing it aborts its request.
        switchMap((q): Observable<SearchState> =>
          q === ''
            ? just(idleState)
            : fromAbortablePromise((signal) => fetchItems(q, signal))
                .pipe(
                  // A rejection arrives as a value: Result.err(error)
                  map((result): SearchState =>
                    Result.isOk(result)
                      ? { status: 'success', query: q, items: result.value }
                      : {
                          status: 'error',
                          query: q,
                          message: toErrorMessage(result.value),
                        },
                  ),
                )
                .pipe(
                  // emitted as soon as the request starts
                  withInitialValue<SearchState>({
                    status: 'loading',
                    query: q,
                  }),
                ),
        ),
      )
      .pipe(withInitialValue(idleState));

    return {
      setQuery,
      searchState,
      dispose: () => {
        scope.dispose();
      },
    };
  });
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  testSearch('SynState', () => {
    const { setQuery, searchState, dispose } = createSearch();

    return {
      setQuery,
      getState: () => searchState.getSnapshot().value,
      dispose,
    };
  });
}
