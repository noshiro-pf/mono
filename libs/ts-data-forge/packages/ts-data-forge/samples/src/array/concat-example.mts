// Example: src/array/array-utils.mts (concat)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const numbers = [1, 2] as const;

    const words = ['three', 'four'] as const;

    const combined = Arr.concat(numbers, words);

    const expectedCombined = [1, 2, 'three', 'four'] as const;

    assert.deepStrictEqual(combined, expectedCombined);

    // embed-sample-code-ignore-below
  });
}
