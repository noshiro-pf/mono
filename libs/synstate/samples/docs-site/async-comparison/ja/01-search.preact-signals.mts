import { effect, signal } from '@preact/signals-core';
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
  const query = signal('');

  // signal は今の値と等しい書き込みを無視するので、
  // 変わっていないクエリは何も引き起こさない。
  const debouncedQuery = signal('');

  const searchState = signal<SearchState>(idleState);

  // debounce はない。クリーンアップでタイマーを解除する effect が
  // キー入力のたびに再実行される。
  const disposeDebounce = effect(() => {
    const q = query.value.trim();

    const timer = setTimeout(() => {
      debouncedQuery.value = q;
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  });

  const disposeFetch = effect(() => {
    const q = debouncedQuery.value;

    if (q === '') {
      searchState.value = idleState;

      return undefined;
    }

    const controller = new AbortController();

    searchState.value = { status: 'loading', query: q };

    fetchItems(q, controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) {
          searchState.value = { status: 'success', query: q, items };
        }
      })
      .catch((error: unknown) => {
        // 置き換えられたリクエストは AbortError で reject される。何も反映しない。
        if (!controller.signal.aborted) {
          searchState.value = {
            status: 'error',
            query: q,
            message: toErrorMessage(error),
          };
        }
      });

    // クリーンアップは次のクエリでの実行の前と、dispose のときに走る。
    return () => {
      controller.abort();
    };
  });

  return {
    query,
    searchState,
    dispose: () => {
      disposeDebounce();

      disposeFetch();
    },
  };
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  testSearch('Preact Signals (ja)', () => {
    const { query, searchState, dispose } = createSearch();

    return {
      setQuery: (q) => {
        query.value = q;
      },
      getState: () => searchState.value,
      dispose,
    };
  });
}
