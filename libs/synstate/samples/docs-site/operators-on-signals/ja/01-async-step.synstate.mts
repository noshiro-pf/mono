import {
  combine,
  createState,
  map,
  switchMap,
  timer,
  withInitialValue,
} from 'synstate';
import {
  answerMs,
  showView,
  type SearchState,
  type SearchView,
} from './00-search-request.mjs';

// embed-sample-code-ignore-above
export const createSearchView = (): SearchView => {
  const [query, setQuery] = createState('a');

  // 新しいクエリは前の内側の Observable を完了させ、
  // それがリクエストを取り消す。
  const searchState = query.pipe(
    switchMap((q) =>
      timer(answerMs)
        .pipe(map((): SearchState => ({ status: 'success', query: q })))
        // クエリと同じ更新の中で出る
        .pipe(withInitialValue<SearchState>({ status: 'loading', query: q })),
    ),
  );

  // ページに表示するもの: 入力欄のクエリと、リストがどのクエリの結果か。
  const view = combine([query, searchState]).pipe(
    map(([q, state]) => showView(q, state)),
  );

  // transformer-ignore-next-line convert-to-readonly, append-as-const
  const viewLog: string[] = [];

  view.subscribe((v) => {
    viewLog.push(v);
  });

  return { setQuery, viewLog };
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('an async step written as switchMap (SynState): one consistent run per query', async () => {
    vi.useFakeTimers();

    try {
      const { setQuery, viewLog } = createSearchView();

      await vi.runAllTimersAsync();

      const before = viewLog.length;

      setQuery('ab');

      assert.deepStrictEqual(viewLog.slice(before), ['ab / loading for ab']);

      await vi.runAllTimersAsync();

      assert.deepStrictEqual(viewLog.slice(before), [
        'ab / loading for ab',
        'ab / success for ab',
      ]);
    } finally {
      vi.useRealTimers();
    }
  });
}
