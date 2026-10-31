import { computed, effect, signal } from '@preact/signals-core';
import {
  answerMs,
  showView,
  type SearchState,
  type SearchView,
} from './00-search-request.mjs';

// embed-sample-code-ignore-above
export const createSearchView = (viewCreatedFirst: boolean): SearchView => {
  const query = signal('a');

  const searchState = signal<SearchState>({ status: 'loading', query: 'a' });

  // ページに表示するもの: 入力欄のクエリと、リストがどのクエリの結果か。
  const view = computed(() => showView(query.value, searchState.value));

  // transformer-ignore-next-line convert-to-readonly, append-as-const
  const viewLog: string[] = [];

  const watchView = (): void => {
    effect(() => {
      viewLog.push(view.value);
    });
  };

  // switchMap((q) => request(q)) を effect で書いたもの。
  const search = (): void => {
    effect(() => {
      const q = query.value;

      searchState.value = { status: 'loading', query: q };

      const answer = setTimeout(() => {
        searchState.value = { status: 'success', query: q };
      }, answerMs);

      // 新しいクエリが実行中のリクエストを取り消す。
      return () => {
        clearTimeout(answer);
      };
    });
  };

  // 違うのは 2 つの effect を作る順番だけ。
  if (viewCreatedFirst) {
    watchView();

    search();
  } else {
    search();

    watchView();
  }

  return {
    setQuery: (q) => {
      query.value = q;
    },
    viewLog,
  };
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  describe('an async step written as an effect (Preact Signals)', () => {
    test('a view created first sees the new query with the old list', async () => {
      vi.useFakeTimers();

      try {
        const { setQuery, viewLog } = createSearchView(true);

        await vi.runAllTimersAsync();

        const before = viewLog.length;

        setQuery('ab');

        assert.deepStrictEqual(viewLog.slice(before), [
          'ab / success for a', // 新しいクエリと古いリスト
          'ab / loading for ab',
        ]);

        await vi.runAllTimersAsync();

        assert.strictEqual(viewLog.at(-1), 'ab / success for ab');
      } finally {
        vi.useRealTimers();
      }
    });

    test('a view created after the effect sees one consistent value', async () => {
      vi.useFakeTimers();

      try {
        const { setQuery, viewLog } = createSearchView(false);

        await vi.runAllTimersAsync();

        const before = viewLog.length;

        setQuery('ab');

        assert.deepStrictEqual(viewLog.slice(before), ['ab / loading for ab']);
      } finally {
        vi.useRealTimers();
      }
    });
  });
}
