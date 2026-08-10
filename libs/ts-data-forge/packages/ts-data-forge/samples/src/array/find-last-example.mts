// Example: src/array/array-utils.mts (findLast)
import { Arr, Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const numbers = [1, 3, 2, 4, 5] as const;

    const lastEven = Arr.findLast(numbers, (n) => n % 2 === 0);

    const none = Arr.findLast<number>((n) => n > 10)(numbers);

    assert.deepStrictEqual(lastEven, Optional.some(4));

    assert.deepStrictEqual(none, Optional.none);

    // embed-sample-code-ignore-below
  });
}
