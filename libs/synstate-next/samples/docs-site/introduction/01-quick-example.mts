import { createState } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('quick example', () => {
    // embed-sample-code-ignore-above
    const [count, setCount, { updateState }] = createState(0);

    const mut_seen: number[] = [];

    // Called at once with the value held, then after every update.
    count.subscribe((value) => {
      mut_seen.push(value);
    });

    setCount(1);

    updateState((n) => n + 1);

    assert.deepStrictEqual(mut_seen, [0, 1, 2]);

    assert.strictEqual(count.value, 2);

    // embed-sample-code-ignore-below
  });
}
