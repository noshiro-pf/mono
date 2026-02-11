// Example: src/array/array-utils.mts (max)
import { Arr, Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const values = [5, 3, 9] as const;

    const largest = Arr.max(values);

    const reversed = Arr.max(values, (a, b) => b - a);

    assert.deepStrictEqual(largest, Optional.some(9));

    assert.deepStrictEqual(reversed, Optional.some(3));

    // embed-sample-code-ignore-below
  });
}
