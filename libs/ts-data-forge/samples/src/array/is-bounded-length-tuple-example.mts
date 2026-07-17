// Example: src/array/array-utils.mts (isBoundedLengthTuple)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const pair: readonly number[] = [1, 2] as const;

    const quad: readonly number[] = [1, 2, 3, 4] as const;

    assert.isTrue(Arr.isBoundedLengthTuple(pair, 1, 3));

    assert.isFalse(Arr.isBoundedLengthTuple(quad, 1, 3));

    if (Arr.isBoundedLengthTuple(pair, 1, 3)) {
      assert.isTrue(pair.length >= 1 && pair.length <= 3);
    }

    // embed-sample-code-ignore-below
  });
}
