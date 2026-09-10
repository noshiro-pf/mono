// Example: src/array/array-utils.mts (asMinLengthTuple)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const history = Arr.asMinLengthTuple(3, [0, 1, 2, 3]);

    const first: number = history[0]; // OK — no `undefined`

    // curried version
    const asHistory = Arr.asMinLengthTuple(3);

    assert.strictEqual(first, 0);

    assert.deepStrictEqual(asHistory([4, 5, 6]), [4, 5, 6]);

    assert.throws(() => Arr.asMinLengthTuple(3, [0, 1]), TypeError);

    // embed-sample-code-ignore-below
  });
}
