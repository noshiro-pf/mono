// Example: src/array/array-utils.mts (asMinLengthArray)
import { Arr } from 'ts-data-forge';
import { type MinLengthArray } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const history = Arr.asMinLengthArray(3, [0, 1, 2, 3]);

    const nonEmpty: MinLengthArray<1, number> = history; // OK (3 >= 1)

    const first: number = history[0]; // OK — no `undefined`

    // curried version
    const asHistory = Arr.asMinLengthArray(3);

    const next = asHistory([4, 5, 6, 7]);

    assert.deepStrictEqual(Array.from(nonEmpty), [0, 1, 2, 3]);

    assert.strictEqual(first, 0);

    assert.deepStrictEqual(next, [4, 5, 6, 7]);

    assert.throws(() => Arr.asMinLengthArray(3, [0]), TypeError);

    // embed-sample-code-ignore-below
  });
}
