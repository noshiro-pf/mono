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
import { testSearch } from '../search-test-suite.mjs';
import {
  debounceMs,
  fetchItems,
  idleState,
  toErrorMessage,
  type SearchState,
} from './00-search-api.mjs';

// embed-sample-code-ignore-above
export const createSearch = () => {
  // `run` の中で作ったものはすべて `scope.dispose()` で破棄される。
  // ページと同じだけ生きる検索ボックスなら scope は要らない。
  const scope = createScope();

  return scope.run(() => {
    const [query, setQuery] = createState('');

    const searchState = query
      .pipe(debounce(debounceMs)) // 入力が止まるのを待つ
      .pipe(map((q) => q.trim())) // map は変化したクエリだけを流す
      .pipe(
        // 新しいクエリが前の内部 Observable を complete し、
        // complete によってそのリクエストが中断される。
        switchMap((q): Observable<SearchState> =>
          q === ''
            ? just(idleState)
            : fromAbortablePromise((signal) => fetchItems(q, signal))
                .pipe(
                  // reject は値として届く：Result.err(error)
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
                  // リクエストの開始と同時に発行される
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
  testSearch('SynState (ja)', () => {
    const { setQuery, searchState, dispose } = createSearch();

    return {
      setQuery,
      getState: () => searchState.getSnapshot().value,
      dispose,
    };
  });
}
