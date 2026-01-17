// Example: src/array/array-utils.mts (zip)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const letters = ['a', 'b', 'c'] as const;

    const numbers = [1, 2, 3] as const;

    const pairs = Arr.zip(letters, numbers);

    const expectedPairs = [
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ] as const;

    assert.deepStrictEqual(pairs, expectedPairs);

    // embed-sample-code-ignore-below
  });
}
