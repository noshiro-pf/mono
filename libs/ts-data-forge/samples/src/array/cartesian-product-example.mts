// Example: src/array/array-utils.mts (cartesianProduct)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const sizes = ['S', 'M'] as const;

    const colors = ['red', 'blue'] as const;

    const combinations = Arr.cartesianProduct([sizes, colors]);

    const expectedCombinations = [
      ['S', 'red'],
      ['S', 'blue'],
      ['M', 'red'],
      ['M', 'blue'],
    ] as const;

    assert.deepStrictEqual(combinations, expectedCombinations);

    // embed-sample-code-ignore-below
  });
}
