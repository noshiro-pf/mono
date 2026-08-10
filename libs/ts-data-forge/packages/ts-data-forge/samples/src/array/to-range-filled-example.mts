// Example: src/array/array-utils.mts (toRangeFilled)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const base = [0, 1, 2, 3, 4] as const;

    const filledMiddle = Arr.toRangeFilled(base, 9, [1, 4]);

    const filledPrefix = Arr.toRangeFilled(8, [0, 2])(base);

    assert.deepStrictEqual(filledMiddle, [0, 9, 9, 9, 4]);

    assert.deepStrictEqual(filledPrefix, [8, 8, 2, 3, 4]);

    // embed-sample-code-ignore-below
  });
}
