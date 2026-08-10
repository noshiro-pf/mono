// Example: src/array/array-utils.mts (isMaxLengthTuple)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const pair: readonly number[] = [1, 2] as const;

    const triple: readonly number[] = [1, 2, 3] as const;

    assert.isTrue(Arr.isMaxLengthTuple(2, pair));

    assert.isFalse(Arr.isMaxLengthTuple(2, triple));

    if (Arr.isMaxLengthTuple(2, pair)) {
      assert.isTrue(pair.length <= 2);
    }

    // embed-sample-code-ignore-below
  });
}
