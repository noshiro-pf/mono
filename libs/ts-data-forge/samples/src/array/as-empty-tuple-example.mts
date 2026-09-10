// Example: src/array/array-utils.mts (asEmptyTuple)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const nothing = Arr.asEmptyTuple([]);

    assert.deepStrictEqual(nothing, []);

    assert.throws(() => Arr.asEmptyTuple([1]), TypeError);

    // embed-sample-code-ignore-below
  });
}
