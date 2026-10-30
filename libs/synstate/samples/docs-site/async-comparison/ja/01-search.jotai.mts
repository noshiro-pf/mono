import { atom, createStore } from 'jotai/vanilla';
import { unwrap } from 'jotai/vanilla/utils';
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
  const store = createStore();

  // プリミティブ atom は今の値と等しい書き込みを無視するので、
  // 変わっていないクエリは何も引き起こさない。
  const debouncedQueryAtom = atom('');

  // Jotai に debounce はない。キー入力のたびに待ち直すタイマーで書く。
  let mut_timer: ReturnType<typeof setTimeout> | undefined;

  const setQuery = (q: string): void => {
    clearTimeout(mut_timer);

    mut_timer = setTimeout(() => {
      store.set(debouncedQueryAtom, q.trim());
    }, debounceMs);
  };

  // 依存が変わって atom が再び読まれると、Jotai は `signal` を中断し、
  // 返された Promise を無視する。購読解除では中断されないので、
  // 破棄用に別の signal を用意する。
  const disposal = new AbortController();

  const resultAtom = atom(
    (get, { signal }): SearchState | Promise<SearchState> => {
      const q = get(debouncedQueryAtom);

      return q === ''
        ? idleState
        : fetchSearchState(q, AbortSignal.any([signal, disposal.signal]));
    },
  );

  // 非同期 atom はサスペンドする。unwrap は保留中の Promise を
  // フォールバック値に置き換えるが、それはクエリを持たない。
  const unwrappedAtom = unwrap(resultAtom, () => undefined);

  const searchStateAtom = atom(
    (get): SearchState =>
      get(unwrappedAtom) ?? {
        status: 'loading',
        query: get(debouncedQueryAtom),
      },
  );

  // atom が購読されるまで何も計算されず、リクエストも送られない
  // （コンポーネントでは useAtomValue がこれを行う）。
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

  // 中断された（破棄されたか、置き換えられてどのみち無視される）：何も新しく見せない。
  return signal.aborted ? { status: 'loading', query: q } : state;
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  testSearch('Jotai (ja)', () => {
    const { store, setQuery, searchStateAtom, dispose } = createSearch();

    return {
      setQuery,
      getState: () => store.get(searchStateAtom),
      dispose,
    };
  });
}
