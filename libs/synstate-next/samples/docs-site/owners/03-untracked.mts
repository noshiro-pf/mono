import {
  createRootOwner,
  createState,
  map,
  untracked,
  type InitializedObservable,
} from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('untracked', () => {
    // embed-sample-code-ignore-above
    const [count, setCount] = createState(1);

    const mut_cache = new Map<string, InitializedObservable<number>>();

    // A cache shared by every caller: what it creates must not go when the
    // first caller's owner does.
    const squared = (): InitializedObservable<number> => {
      const cached = mut_cache.get('squared');

      if (cached !== undefined) {
        return cached;
      }

      const created = untracked(() => count.pipe(map((n) => n ** 2)));

      mut_cache.set('squared', created);

      return created;
    };

    const first = createRootOwner();

    const s = first.run(squared);

    first.dispose();

    setCount(3);

    // Still following `count`.
    assert.strictEqual(s.value, 9);

    // embed-sample-code-ignore-below
  });
}
