import { state } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('state', () => {
    // embed-sample-code-ignore-above
    // The primitive `createState` wraps: one object with `set` and `update`.
    const count = state(0);

    const mut_seen: number[] = [];

    count.subscribe((n) => {
      mut_seen.push(n);
    });

    count.set(1);

    count.update((n) => n + 1);

    // An equal value passes nothing on.
    count.set(2);

    assert.deepStrictEqual(mut_seen, [0, 1, 2]);

    // embed-sample-code-ignore-below
  });
}
