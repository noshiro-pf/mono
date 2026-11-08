import { createState } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('createState', () => {
    // embed-sample-code-ignore-above
    const [count, setCount, { updateState, resetState, getSnapshot }] =
      createState(0);

    const mut_seen: number[] = [];

    count.subscribe((value) => {
      mut_seen.push(value);
    });

    setCount(10);

    updateState((n) => n + 1);

    // An equal value passes nothing on.
    setCount(11);

    assert.strictEqual(getSnapshot(), 11);

    resetState();

    assert.deepStrictEqual(mut_seen, [0, 10, 11, 0]);

    // embed-sample-code-ignore-below
  });
}
