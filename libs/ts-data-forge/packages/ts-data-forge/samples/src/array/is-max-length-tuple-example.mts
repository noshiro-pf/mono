// Example: src/array/array-utils.mts (isMaxLengthTuple)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const pair: readonly number[] = [1, 2] as const;

    const triple: readonly number[] = [1, 2, 3] as const;

    assert.isTrue(Arr.isMaxLengthTuple(pair, 2));

    assert.isFalse(Arr.isMaxLengthTuple(triple, 2));

    if (Arr.isMaxLengthTuple(pair, 2)) {
      assert.isTrue(pair.length <= 2);
    }

    // embed-sample-code-ignore-below
  });
}
