import {
  configureStore,
  createAction,
  createListenerMiddleware,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { testSearch } from '../search-test-suite.mjs';
import {
  debounceMs,
  fetchItems,
  idleState,
  toErrorMessage,
  type Item,
  type SearchState,
} from './00-search-api.mjs';

// embed-sample-code-ignore-above
export const createSearch = () => {
  const listener = createListenerMiddleware<Readonly<{ search: SliceState }>>();

  // debounce：キー入力のたびに、`delay` で待機中の実行をキャンセルする。
  listener.startListening({
    actionCreator: queryChanged,
    effect: async (action, api) => {
      api.cancelActiveListeners();

      await api.delay(debounceMs); // この実行がキャンセルされると reject される

      const q = action.payload.trim();

      if (q !== api.getState().search.debouncedQuery) {
        api.dispatch(queryDebounced(q));
      }
    },
  });

  // fetch：キー入力でリクエストがキャンセルされないよう listener を分ける。
  // キャンセルするのは次の debounce 済みクエリだけで、`signal` の中断による。
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

        // キャンセルされた実行は、リクエストが中断前に決着していても、
        // 中断で reject されても、何も反映しない。
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
    // 実行中の listener をすべてキャンセルする：タイマーもリクエストも。
    dispose: () => {
      listener.clearListeners();
    },
  };
};

type SliceState = Readonly<{
  debouncedQuery: string;
  searchState: SearchState;
}>;

// これを読むのは debounce の listener だけで、reducer は読まない。
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
  testSearch('Redux Toolkit (ja)', () => {
    const { store, setQuery, dispose } = createSearch();

    return {
      setQuery,
      getState: () => store.getState().search.searchState,
      dispose,
    };
  });
}
