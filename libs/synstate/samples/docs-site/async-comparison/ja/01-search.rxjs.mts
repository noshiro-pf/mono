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
import { testSearch } from '../search-test-suite.mjs';
import {
  debounceMs,
  idleState,
  parseResponse,
  searchUrl,
  toErrorMessage,
  type SearchState,
} from './00-search-api.mjs';

// embed-sample-code-ignore-above
export const createSearch = () => {
  const query$ = new Subject<string>();

  // RxJS の Observable は現在値を持たない。BehaviorSubject が保持する。
  const searchState$ = new BehaviorSubject<SearchState>(idleState);

  const subscription = query$
    .pipe(
      debounceTime(debounceMs), // 入力が止まるのを待つ
      map((q) => q.trim()),
      distinctUntilChanged(), // 変わっていないクエリは飛ばす
      // 新しいクエリは前のリクエストの購読を解除し、
      // fromFetch は購読解除されたリクエストを中断する。
      switchMap((q): Observable<SearchState> =>
        q === ''
          ? of(idleState)
          : fromFetch(searchUrl(q), { selector: parseResponse }).pipe(
              map((items): SearchState => ({
                status: 'success',
                query: q,
                items,
              })),
              // switchMap の内側で捕捉する。外側のパイプに届いたエラーは
              // パイプを終わらせ、検索ボックスも止まる。
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
  testSearch('RxJS (ja)', () => {
    const { setQuery, searchState$, dispose } = createSearch();

    return {
      setQuery,
      getState: () => searchState$.getValue(),
      dispose,
    };
  });
}
