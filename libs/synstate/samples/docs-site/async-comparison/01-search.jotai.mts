import { atom, createStore } from 'jotai/vanilla';
import { unwrap } from 'jotai/vanilla/utils';
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
  const store = createStore();

  // A primitive atom ignores a write equal to its value,
  // so a query that did not change triggers nothing.
  const debouncedQueryAtom = atom('');

  // Jotai has no debounce; a timer restarted on every keystroke.
  let mut_timer: ReturnType<typeof setTimeout> | undefined;

  const setQuery = (q: string): void => {
    clearTimeout(mut_timer);

    mut_timer = setTimeout(() => {
      store.set(debouncedQueryAtom, q.trim());
    }, debounceMs);
  };

  // Jotai aborts `signal` when a dependency changes and the atom is
  // read again, and ignores the promise it returned. Unsubscribing does
  // not abort it, so disposal brings a signal of its own.
  const disposal = new AbortController();

  const resultAtom = atom(
    (get, { signal }): SearchState | Promise<SearchState> => {
      const q = get(debouncedQueryAtom);

      return q === ''
        ? idleState
        : fetchSearchState(q, AbortSignal.any([signal, disposal.signal]));
    },
  );

  // An async atom suspends; unwrap turns the pending promise into a
  // fallback value, which carries no query of its own.
  const unwrappedAtom = unwrap(resultAtom, () => undefined);

  const searchStateAtom = atom(
    (get): SearchState =>
      get(unwrappedAtom) ?? {
        status: 'loading',
        query: get(debouncedQueryAtom),
      },
  );

  // Nothing is computed, and no request sent, until an atom is
  // subscribed to (useAtomValue in a component does this).
  const unsubscribe = store.sub(searchStateAtom, () => {});

  return {
    store,
    setQuery,
    searchStateAtom,
    dispose: () => {
      clearTimeout(mut_timer);

      unsubscribe();

      disposal.abort();
    },
  };
};

const fetchSearchState = async (
  q: string,
  /* embed-sample-code-ignore-this-line */ // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- `fetch` takes a mutable `AbortSignal`.
  signal: AbortSignal,
): Promise<SearchState> => {
  const state = await fetchItems(q, signal)
    .then((items): SearchState => ({ status: 'success', query: q, items }))
    .catch((error: unknown): SearchState => ({
      status: 'error',
      query: q,
      message: toErrorMessage(error),
    }));

  // Aborted (disposed of, or replaced and ignored anyway): show nothing new.
  return signal.aborted ? { status: 'loading', query: q } : state;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  testSearch('Jotai', () => {
    const { store, setQuery, searchStateAtom, dispose } = createSearch();

    return {
      setQuery,
      getState: () => store.get(searchStateAtom),
      dispose,
    };
  });
}
