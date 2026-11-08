import { createState, map } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('a chain of derived values', () => {
    // embed-sample-code-ignore-above
    const [count, setCount] = createState(0);

    const doubled = count.pipe(map((n) => n * 2));

    const quadrupled = doubled.pipe(map((n) => n * 2));

    setCount(3);

    assert.strictEqual(quadrupled.value, 12);

    // embed-sample-code-ignore-below
  });
}
