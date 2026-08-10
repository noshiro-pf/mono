// Example: src/array/array-utils.mts (toUnshifted)
import { Arr } from 'ts-data-forge';
import { type NonEmptyArray } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const base = [2, 3] as const;

    const prefixed = Arr.toUnshifted(base, 1);

    const prefixedCurried = Arr.toUnshifted(0)(base);

    // The result is guaranteed non-empty, so it is assignable to NonEmptyArray.
    const nonEmpty: NonEmptyArray<number> = prefixed;

    assert.deepStrictEqual<readonly number[]>(prefixed, [1, 2, 3]);

    assert.deepStrictEqual<readonly number[]>(prefixedCurried, [0, 2, 3]);

    assert.isTrue(nonEmpty.length >= 1);

    // embed-sample-code-ignore-below
  });
}
