// Example: src/array/array-utils.mts (sumBy)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const numbers = [
      { value: 1 },
      { value: 2 },
      { value: 3 },
      { value: 4 },
    ] as const;

    const negatives = [{ value: 3 }, { value: -2 }, { value: 5 }] as const;

    const total = Arr.sumBy(numbers, (item) => item.value);

    const totalNegatives = Arr.sumBy(negatives, (item) => item.value);

    assert.isTrue(total === 10);

    assert.isTrue(totalNegatives === 6);

    // embed-sample-code-ignore-below
  });
}
