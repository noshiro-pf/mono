// Example: src/array/array-utils.mts (asBoundedLengthArray)
import { Arr } from 'ts-data-forge';
import { type BoundedLengthArray } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const selection = Arr.asBoundedLengthArray(1, 5, [1, 2, 3]);

    const relaxed: BoundedLengthArray<0, 100, number> = selection; // OK

    // curried version
    const asSelection = Arr.asBoundedLengthArray(1, 5);

    const next = asSelection([4, 5]);

    assert.deepStrictEqual(Array.from(relaxed), [1, 2, 3]);

    assert.deepStrictEqual(next, [4, 5]);

    assert.throws(() => Arr.asBoundedLengthArray(1, 5, []), TypeError);

    // embed-sample-code-ignore-below
  });
}
