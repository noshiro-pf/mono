// Example: src/array/array-utils.mts (asNonEmptyTuple)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const values = Arr.asNonEmptyTuple([1, 2, 3]);

    const first: number = values[0]; // OK — no `undefined`

    assert.strictEqual(first, 1);

    assert.throws(() => Arr.asNonEmptyTuple([]), TypeError);

    // embed-sample-code-ignore-below
  });
}
