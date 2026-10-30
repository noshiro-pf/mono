import { testSearch } from '../search-test-suite.mjs';
import {
  createEffect,
  createMemo,
  createResource,
  createRoot,
  createSignal,
  onCleanup,
} from '../solid-js-client.mjs';
import {
  debounceMs,
  fetchItems,
  idleState,
  toErrorMessage,
  type SearchState,
} from './00-search-api.mjs';

// embed-sample-code-ignore-above
export const createSearch = () =>
  createRoot((dispose) => {
    const [query, setQuery] = createSignal('');

    // signal は今の値と等しい書き込みを無視するので、
    // 変わっていないクエリは何も引き起こさない。
    const [debouncedQuery, setDebouncedQuery] = createSignal('');

    // debounce はない。クリーンアップでタイマーを解除する effect が
    // キー入力のたびに再実行される。
    createEffect(() => {
      const q = query().trim();

      const timer = setTimeout(() => setDebouncedQuery(q), debounceMs);

      onCleanup(() => {
        clearTimeout(timer);
      });
    });

    // createResource は古いレスポンスを無視するが、fetcher に AbortSignal を
    // 渡さない。クエリごとに controller を作り、クエリが変わったときと
    // root が破棄されたときに走るクリーンアップで中断する。
    const signal = createMemo(() => {
      debouncedQuery();

      const controller = new AbortController();

      onCleanup(() => {
        controller.abort();
      });

      return controller.signal;
    });

    // ソースが `false` なら何も fetch しない（そして最後の値を保持する）。
    const [items] = createResource(
      () => {
        const q = debouncedQuery();

        return q !== '' && q;
      },
      (q) => fetchItems(q, signal()),
    );

    const searchState = createMemo((): SearchState => {
      const q = debouncedQuery();

      if (q === '') {
        return idleState;
      }

      // エラーになったリソースを読むと例外が投げられるので、先に state を確かめる。
      switch (items.state) {
        case 'errored':
          return {
            status: 'error',
            query: q,
            message: toErrorMessage(items.error),
          };

        case 'ready':
          return { status: 'success', query: q, items: items() };

        case 'unresolved':
        case 'pending':
        case 'refreshing':
          return { status: 'loading', query: q };
      }
    });

    return { setQuery, searchState, dispose };
  });
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  testSearch('Solid (ja)', () => {
    const { setQuery, searchState, dispose } = createSearch();

    return {
      setQuery,
      getState: searchState,
      dispose,
    };
  });
}
