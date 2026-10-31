import { effect, signal } from '@preact/signals-core';
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
  const query = signal('');

  // A signal ignores a write equal to its value, so a query that did not change
  // triggers nothing.
  const debouncedQuery = signal('');

  const searchState = signal<SearchState>(idleState);

  // There is no debounce; an effect whose cleanup clears the timer runs again
  // on every keystroke.
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
        // A replaced request rejects with an AbortError; it reports nothing.
        if (!controller.signal.aborted) {
          searchState.value = {
            status: 'error',
            query: q,
            message: toErrorMessage(error),
          };
        }
      });

    // The cleanup runs before the next query's run, and on dispose.
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
  testSearch('Preact Signals', () => {
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
