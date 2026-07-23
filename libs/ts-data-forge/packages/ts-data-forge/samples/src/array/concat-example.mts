// Example: src/array/array-utils.mts (concat)
import { Arr } from 'ts-data-forge';
import { type NonEmptyArray } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const numbers = [1, 2] as const;

    const words = ['three', 'four'] as const;

    const combined = Arr.concat(numbers, words);

    // Because at least one input is non-empty, the result is assignable to
    // NonEmptyArray.
    const nonEmpty: NonEmptyArray<number | string> = combined;

    const expectedCombined = [1, 2, 'three', 'four'] as const;

    assert.deepStrictEqual<readonly (number | string)[]>(
      combined,
      expectedCombined,
    );

    assert.isTrue(nonEmpty.length >= 1);

    // embed-sample-code-ignore-below
  });
}
