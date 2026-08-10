// Example: src/array/array-utils.mts (isNonEmptyTuple)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const values: readonly number[] = [1, 2] as const;

    assert.isTrue(Arr.isNonEmptyTuple(values));

    assert.isFalse(Arr.isNonEmptyTuple([] as const));

    // embed-sample-code-ignore-below
  });
}
