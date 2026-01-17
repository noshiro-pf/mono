// Example: src/array/array-utils.mts (flat)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const nested = [
      [1, 2],
      [3, 4],
    ] as const;

    const flatOnce = Arr.flat(nested, 1);

    const flatCurried = Arr.flat()(nested);

    assert.deepStrictEqual(flatOnce, [1, 2, 3, 4]);

    assert.deepStrictEqual(flatCurried, [1, 2, 3, 4]);

    // embed-sample-code-ignore-below
  });
}
