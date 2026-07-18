// Example: src/array/array-utils.mts (sum)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const numbers = [1, 2, 3, 4] as const;

    const negatives = [3, -2, 5] as const;

    const total = Arr.sum(numbers);

    const totalNegatives = Arr.sum(negatives);

    assert.isTrue(total === 10);

    assert.isTrue(totalNegatives === 6);

    // embed-sample-code-ignore-below
  });
}
