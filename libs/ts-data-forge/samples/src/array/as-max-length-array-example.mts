// Example: src/array/array-utils.mts (asMaxLengthArray)
import { Arr } from 'ts-data-forge';
import { type MaxLengthArray } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const tags = Arr.asMaxLengthArray(8, ['a', 'b', 'c']);

    const relaxed: MaxLengthArray<16, string> = tags; // OK (8 <= 16)

    // curried version
    const asTags = Arr.asMaxLengthArray(8);

    const more = asTags(['d', 'e']);

    assert.deepStrictEqual(Array.from(relaxed), ['a', 'b', 'c']);

    assert.deepStrictEqual(more, ['d', 'e']);

    assert.throws(() => Arr.asMaxLengthArray(2, ['a', 'b', 'c']), TypeError);

    // embed-sample-code-ignore-below
  });
}
