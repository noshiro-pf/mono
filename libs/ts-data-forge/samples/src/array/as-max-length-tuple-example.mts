// Example: src/array/array-utils.mts (asMaxLengthTuple)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const tags = Arr.asMaxLengthTuple(8, ['a', 'b', 'c']);

    // curried version
    const asTags = Arr.asMaxLengthTuple(8);

    assert.deepStrictEqual(tags, ['a', 'b', 'c']);

    assert.deepStrictEqual(asTags(['d', 'e']), ['d', 'e']);

    assert.throws(() => Arr.asMaxLengthTuple(2, ['a', 'b', 'c']), TypeError);

    // embed-sample-code-ignore-below
  });
}
