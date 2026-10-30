import { action, observable, reaction } from 'mobx';
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
  const query = observable.box('');

  // `deep: false`: the state is replaced as a whole, never mutated.
  const searchState = observable.box<SearchState>(idleState, { deep: false });

  let mut_timer: ReturnType<typeof setTimeout> | undefined;

  let mut_controller: AbortController | undefined;

  let mut_lastQuery = '';

  const setSearchState = action((state: SearchState) => {
    searchState.set(state);
  });

  const search = (q: string): void => {
    mut_controller?.abort(); // cancel the request this query replaces

    if (q === '') {
      setSearchState(idleState);

      return;
    }

    const controller = new AbortController();

    mut_controller = controller;

    setSearchState({ status: 'loading', query: q });

    fetchItems(q, controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) {
          setSearchState({ status: 'success', query: q, items });
        }
      })
      .catch((error: unknown) => {
        // A replaced request rejects with an AbortError; it reports nothing.
        if (!controller.signal.aborted) {
          setSearchState({
            status: 'error',
            query: q,
            message: toErrorMessage(error),
          });
        }
      });
  };

  // reaction's `delay` option runs the effect `delay` ms after the
  // *first* change, which throttles; a debounce is written by hand.
  const disposeReaction = reaction(
    () => query.get(), // untrimmed: a typed space restarts the wait too
    (typed) => {
      clearTimeout(mut_timer);

      mut_timer = setTimeout(() => {
        const q = typed.trim();

        if (q === mut_lastQuery) {
          return;
        }

        mut_lastQuery = q;

        search(q);
      }, debounceMs);
    },
  );

  return {
    setQuery: action((q: string) => {
      query.set(q);
    }),
    searchState,
    dispose: () => {
      disposeReaction();

      clearTimeout(mut_timer);

      mut_controller?.abort();
    },
  };
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  testSearch('MobX', () => {
    const { setQuery, searchState, dispose } = createSearch();

    return {
      setQuery,
      getState: () => searchState.get(),
      dispose,
    };
  });
}
