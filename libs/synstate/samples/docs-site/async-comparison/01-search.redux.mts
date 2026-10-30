import {
  configureStore,
  createAction,
  createListenerMiddleware,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import {
  debounceMs,
  fetchItems,
  idleState,
  toErrorMessage,
  type Item,
  type SearchState,
} from './00-search-api.mjs';
import { testSearch } from './search-test-suite.mjs';

// embed-sample-code-ignore-above
export const createSearch = () => {
  const listener = createListenerMiddleware<Readonly<{ search: SliceState }>>();

  // Debounce: each keystroke cancels the run still waiting in `delay`.
  listener.startListening({
    actionCreator: queryChanged,
    effect: async (action, api) => {
      api.cancelActiveListeners();

      await api.delay(debounceMs); // rejects once this run is cancelled

      const q = action.payload.trim();

      if (q !== api.getState().search.debouncedQuery) {
        api.dispatch(queryDebounced(q));
      }
    },
  });

  // Fetch: a separate listener, so that a keystroke does not cancel
  // a request; only the next debounced query does, by aborting `signal`.
  listener.startListening({
    actionCreator: queryDebounced,
    effect: async (action, api) => {
      api.cancelActiveListeners();

      const q = action.payload;

      if (q === '') {
        api.dispatch(searchCleared());

        return;
      }

      api.dispatch(searchStarted(q));

      try {
        const items = await fetchItems(q, api.signal);

        // A cancelled run reports nothing, whether its request
        // settled before the abort or rejected because of it.
        if (!api.signal.aborted) {
          api.dispatch(searchSucceeded({ query: q, items }));
        }
      } catch (error) {
        if (!api.signal.aborted) {
          api.dispatch(
            searchFailed({ query: q, message: toErrorMessage(error) }),
          );
        }
      }
    },
  });

  const store = configureStore({
    reducer: { search: searchSlice.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(listener.middleware),
  });

  return {
    store,
    setQuery: (q: string) => {
      store.dispatch(queryChanged(q));
    },
    // Cancels every running listener: the timer and the request.
    dispose: () => {
      listener.clearListeners();
    },
  };
};

type SliceState = Readonly<{
  debouncedQuery: string;
  searchState: SearchState;
}>;

// Only the debounce listener reads it; no reducer does.
const queryChanged = createAction<string>('search/queryChanged');

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    debouncedQuery: '',
    searchState: idleState,
  } satisfies SliceState,
  reducers: {
    queryDebounced: (state, action: Readonly<PayloadAction<string>>) => ({
      ...state,
      debouncedQuery: action.payload,
    }),
    searchCleared: (state) => ({ ...state, searchState: idleState }),
    searchStarted: (state, action: Readonly<PayloadAction<string>>) => ({
      ...state,
      searchState: { status: 'loading', query: action.payload },
    }),
    searchSucceeded: (
      state,
      action: Readonly<
        PayloadAction<Readonly<{ query: string; items: readonly Item[] }>>
      >,
    ) => ({
      ...state,
      searchState: { status: 'success', ...action.payload },
    }),
    searchFailed: (
      state,
      action: Readonly<
        PayloadAction<Readonly<{ query: string; message: string }>>
      >,
    ) => ({
      ...state,
      searchState: { status: 'error', ...action.payload },
    }),
  },
});

const {
  queryDebounced,
  searchCleared,
  searchStarted,
  searchSucceeded,
  searchFailed,
} = searchSlice.actions;
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  testSearch('Redux Toolkit', () => {
    const { store, setQuery, dispose } = createSearch();

    return {
      setQuery,
      getState: () => store.getState().search.searchState,
      dispose,
    };
  });
}
