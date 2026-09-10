// Example: src/array/array-utils.mts (asNonEmptyArray)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const history = Arr.asNonEmptyArray([0, 1, 2, 3]);

    const first: number = history[0]; // OK — no `undefined`

    assert.strictEqual(first, 0);

    assert.throws(() => Arr.asNonEmptyArray([]), TypeError);

    // embed-sample-code-ignore-below
  });
}
