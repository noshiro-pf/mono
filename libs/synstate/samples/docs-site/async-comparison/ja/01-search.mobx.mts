import { action, observable, reaction } from 'mobx';
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
  const query = observable.box('');

  // `deep: false`：状態は丸ごと置き換え、書き換えない。
  const searchState = observable.box<SearchState>(idleState, { deep: false });

  let mut_timer: ReturnType<typeof setTimeout> | undefined;

  let mut_controller: AbortController | undefined;

  let mut_lastQuery = '';

  const setSearchState = action((state: SearchState) => {
    searchState.set(state);
  });

  const search = (q: string): void => {
    mut_controller?.abort(); // このクエリが置き換えるリクエストをキャンセル

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
        // 置き換えられたリクエストは AbortError で reject される。何も反映しない。
        if (!controller.signal.aborted) {
          setSearchState({
            status: 'error',
            query: q,
            message: toErrorMessage(error),
          });
        }
      });
  };

  // reaction の `delay` オプションは「最初の」変更から `delay` ms 後に
  // effect を実行するので throttle になる。debounce は手で書く。
  const disposeReaction = reaction(
    () => query.get(), // trim しない：空白の入力でも待ち直す
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
  testSearch('MobX (ja)', () => {
    const { setQuery, searchState, dispose } = createSearch();

    return {
      setQuery,
      getState: () => searchState.get(),
      dispose,
    };
  });
}
