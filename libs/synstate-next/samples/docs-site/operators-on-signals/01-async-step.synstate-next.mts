import {
  combine,
  createState,
  map,
  switchMap,
  timer,
  withInitialValue,
} from 'synstate-next';
import {
  answerMs,
  showView,
  type SearchState,
  type SearchView,
} from './00-search-request.mjs';

// embed-sample-code-ignore-above
export const createSearchView = (): SearchView => {
  const [query, setQuery] = createState('a');

  // A newer query disposes the previous inner observable, which cancels its
  // request.
  const searchState = query.pipe(
    switchMap((q) =>
      timer(answerMs).pipe(
        map((): SearchState => ({ status: 'success', query: q })),
        // held in the same update as the query
        withInitialValue<SearchState>({ status: 'loading', query: q }),
      ),
    ),
  );

  // What the page shows: the query in the box, and what the list is for.
  const view = combine([query, searchState]).pipe(
    map(([q, state]) => showView(q, state)),
  );

  const mut_viewLog: string[] = [];

  view.subscribe((v) => {
    mut_viewLog.push(v);
  });

  return { setQuery, viewLog: mut_viewLog };
};
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  test('an async step written as switchMap (synstate-next): one consistent run per query', async () => {
    vi.useFakeTimers();

    try {
      const { setQuery, viewLog } = createSearchView();

      assert.deepStrictEqual(viewLog, ['a / loading for a']);

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
