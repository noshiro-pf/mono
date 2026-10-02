import { createState, map } from 'synstate';
import { fastDeepEqual } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('createState with equals', () => {
    // embed-sample-code-ignore-above

    const [filters, setFilters] = createState(
      { label: 'bug', page: 1 },
      { equals: fastDeepEqual },
    );

    const before = filters.getSnapshot().value;

    // Derived state is recomputed only when the state really changes.
    const query = filters.pipe(
      map(({ label, page }) => `label:${label} page:${page}`),
    );

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const queryHistory: string[] = [];

    query.subscribe((value: string) => {
      queryHistory.push(value);
    });

    setFilters({ label: 'bug', page: 1 }); // equal: nothing is passed on

    assert.strictEqual(filters.getSnapshot().value, before);

    setFilters({ label: 'bug', page: 2 });

    assert.deepStrictEqual(queryHistory, [
      'label:bug page:1',
      'label:bug page:2',
    ]);

    // embed-sample-code-ignore-below
  });
}
