import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  Subject,
  switchMap,
  type Observable,
} from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import {
  debounceMs,
  idleState,
  parseResponse,
  searchUrl,
  toErrorMessage,
  type SearchState,
} from './00-search-api.mjs';
import { testSearch } from './search-test-suite.mjs';

// embed-sample-code-ignore-above
export const createSearch = () => {
  const query$ = new Subject<string>();

  // An RxJS observable holds no current value; a BehaviorSubject keeps one.
  const searchState$ = new BehaviorSubject<SearchState>(idleState);

  const subscription = query$
    .pipe(
      debounceTime(debounceMs), // wait for typing to pause
      map((q) => q.trim()),
      distinctUntilChanged(), // skip a query that did not change
      // A newer query unsubscribes from the previous request,
      // and fromFetch aborts a request it is unsubscribed from.
      switchMap((q): Observable<SearchState> =>
        q === ''
          ? of(idleState)
          : fromFetch(searchUrl(q), { selector: parseResponse }).pipe(
              map((items): SearchState => ({
                status: 'success',
                query: q,
                items,
              })),
              // Caught inside switchMap: an error that reached the outer
              // pipe would end it, and the search box with it.
              catchError((error: unknown) =>
                of<SearchState>({
                  status: 'error',
                  query: q,
                  message: toErrorMessage(error),
                }),
              ),
              startWith<SearchState>({ status: 'loading', query: q }),
            ),
      ),
    )
    .subscribe(searchState$);

  return {
    setQuery: (q: string) => {
      query$.next(q);
    },
    searchState$,
    dispose: () => {
      subscription.unsubscribe();

      searchState$.complete();
    },
  };
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  testSearch('RxJS', () => {
    const { setQuery, searchState$, dispose } = createSearch();

    return {
      setQuery,
      getState: () => searchState$.getValue(),
      dispose,
    };
  });
}
