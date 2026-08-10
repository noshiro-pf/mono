// Example: src/array/array-utils.mts (isEmptyTuple)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const values: readonly number[] = [] as const;

    assert.isTrue(Arr.isEmptyTuple(values));

    assert.isFalse(Arr.isEmptyTuple([1] as const));

    // embed-sample-code-ignore-below
  });
}
