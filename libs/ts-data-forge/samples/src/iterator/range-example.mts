// Example: src/iterator/range.mts (range)
import { range } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const zeroToThree = Array.from(range(0, 3));

    const threeToZero = Array.from(range(3, 0, -1));

    const defaultEnd = Array.from(range(4));

    assert.deepStrictEqual(zeroToThree, [0, 1, 2]);

    assert.deepStrictEqual(threeToZero, [3, 2, 1]);

    assert.deepStrictEqual(defaultEnd, [0, 1, 2, 3]);

    // embed-sample-code-ignore-below
  });
}
