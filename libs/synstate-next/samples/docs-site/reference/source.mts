import { source } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('source', () => {
    // embed-sample-code-ignore-above
    const ticks = source<number>();

    // An event source holds no value until its first `next`.
    assert.isFalse(ticks.hasValue);

    const mut_seen: number[] = [];

    ticks.subscribe((n) => {
      mut_seen.push(n);
    });

    ticks.next(1);

    ticks.next(1);

    assert.deepStrictEqual(mut_seen, [1, 1]);

    // embed-sample-code-ignore-below
  });
}
