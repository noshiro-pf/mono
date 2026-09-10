// Example: src/array/array-utils.mts (asEmptyArray)
import { Arr } from 'ts-data-forge';
import { type MaxLengthArray } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const nothing = Arr.asEmptyArray([]);

    const atMost5: MaxLengthArray<5, never> = nothing; // OK (0 <= 5)

    assert.deepStrictEqual(Array.from(atMost5), []);

    assert.throws(() => Arr.asEmptyArray([1]), TypeError);

    // embed-sample-code-ignore-below
  });
}
