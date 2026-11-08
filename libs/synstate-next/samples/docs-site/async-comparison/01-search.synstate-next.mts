import {
  createRootOwner,
  createState,
  debounce,
  fromAbortablePromise,
  just,
  map,
  switchMap,
  withInitialValue,
  type InitializedObservable,
  type Observable,
} from 'synstate-next';
import { Result } from 'ts-std-forge';
import {
  debounceMs,
  fetchItems,
  idleState,
  toErrorMessage,
  type SearchState,
} from './00-search-api.mjs';
import { testSearch } from './search-test-suite.mjs';

// embed-sample-code-ignore-above
export const createSearch = (): Search => {
  // Everything created inside `run` belongs to the owner, and `owner.dispose()`
  // tears it down. A search box that lives as long as the page can skip the
  // owner.
  const owner = createRootOwner();

  return owner.run(() => {
    const [query, setQuery] = createState('');

    const searchState = query.pipe(
      debounce(debounceMs), // wait for typing to pause
      map((q) => q.trim()), // map passes on only a changed query
      // A newer query disposes the previous inner observable, and disposing it
      // aborts its request.
      switchMap((q): Observable<SearchState> =>
        q === ''
          ? just(idleState)
          : fromAbortablePromise((signal) => fetchItems(q, signal)).pipe(
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
              // held as soon as the request starts
              withInitialValue<SearchState>({ status: 'loading', query: q }),
            ),
      ),
      withInitialValue(idleState),
    );

    return {
      setQuery,
      searchState,
      dispose: () => {
        owner.dispose();
      },
    };
  });
};

type Search = Readonly<{
  setQuery: (query: string) => void;
  searchState: InitializedObservable<SearchState>;
  dispose: () => void;
}>;
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  testSearch('synstate-next', () => {
    const { setQuery, searchState, dispose } = createSearch();

    return {
      setQuery,
      getState: () => searchState.value,
      dispose,
    };
  });
}
