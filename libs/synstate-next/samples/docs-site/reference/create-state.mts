import { createState } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('create-state', () => {
    // embed-sample-code-ignore-above
    const [count, setCount, { updateState, resetState, getSnapshot }] =
      createState(0);

    const mut_seen: number[] = [];

    count.subscribe((n) => {
      mut_seen.push(n);
    });

    setCount(5);

    updateState((n) => n + 1);

    assert.strictEqual(getSnapshot(), 6);

    resetState();

    assert.deepStrictEqual(mut_seen, [0, 5, 6, 0]);

    // embed-sample-code-ignore-below
  });
}
