import {
  debounceMs,
  fetchItems,
  idleState,
  toErrorMessage,
  type SearchState,
} from './00-search-api.mjs';
import { testSearch } from './search-test-suite.mjs';
import {
  createEffect,
  createMemo,
  createResource,
  createRoot,
  createSignal,
  onCleanup,
} from './solid-js-client.mjs';

// embed-sample-code-ignore-above
export const createSearch = () =>
  createRoot((dispose) => {
    const [query, setQuery] = createSignal('');

    // A signal ignores a write equal to its value,
    // so a query that did not change triggers nothing.
    const [debouncedQuery, setDebouncedQuery] = createSignal('');

    // There is no debounce; an effect whose cleanup clears the timer
    // runs again on every keystroke.
    createEffect(() => {
      const q = query().trim();

      const timer = setTimeout(() => setDebouncedQuery(q), debounceMs);

      onCleanup(() => {
        clearTimeout(timer);
      });
    });

    // createResource ignores a stale response but hands the fetcher no
    // AbortSignal. One controller per query, aborted by the cleanup that
    // runs when the query changes and when the root is disposed:
    const signal = createMemo(() => {
      debouncedQuery();

      const controller = new AbortController();

      onCleanup(() => {
        controller.abort();
      });

      return controller.signal;
    });

    // A `false` source fetches nothing (and keeps the last value).
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

      // Reading an errored resource throws; ask for its state first.
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
  testSearch('Solid', () => {
    const { setQuery, searchState, dispose } = createSearch();

    return {
      setQuery,
      getState: searchState,
      dispose,
    };
  });
}
