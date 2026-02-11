// Example: src/array/array-utils.mts (take)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const values = [1, 2, 3, 4] as const;

    const firstTwo = Arr.take(values, 2);

    const firstThree = Arr.take(3)(values);

    assert.deepStrictEqual(firstTwo, [1, 2]);

    assert.deepStrictEqual(firstThree, [1, 2, 3]);

    // embed-sample-code-ignore-below
  });
}
