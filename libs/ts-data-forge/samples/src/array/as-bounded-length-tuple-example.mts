// Example: src/array/array-utils.mts (asBoundedLengthTuple)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const selection = Arr.asBoundedLengthTuple(1, 5, [1, 2, 3]);

    // curried version
    const asSelection = Arr.asBoundedLengthTuple(1, 5);

    assert.deepStrictEqual(selection, [1, 2, 3]);

    assert.deepStrictEqual(asSelection([4, 5]), [4, 5]);

    assert.throws(() => Arr.asBoundedLengthTuple(1, 2, [1, 2, 3]), TypeError);

    // embed-sample-code-ignore-below
  });
}
