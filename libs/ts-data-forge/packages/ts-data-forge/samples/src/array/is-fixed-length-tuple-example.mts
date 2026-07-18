// Example: src/array/array-utils.mts (isFixedLengthTuple)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const pair: readonly number[] = [1, 2] as const;

    const triple: readonly number[] = [1, 2, 3] as const;

    assert.isTrue(Arr.isFixedLengthTuple(pair, 2));

    assert.isFalse(Arr.isFixedLengthTuple(triple, 2));

    if (Arr.isFixedLengthTuple(pair, 2)) {
      assert.deepStrictEqual(pair, [1, 2]);
    }

    // embed-sample-code-ignore-below
  });
}
