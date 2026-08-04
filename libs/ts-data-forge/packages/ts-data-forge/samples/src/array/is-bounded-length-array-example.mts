// Example: src/array/array-utils.mts (isBoundedLengthArray)
import { Arr } from 'ts-data-forge';
import { type BoundedLengthArray } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const input: readonly number[] = [1, 2, 3] as const;

    assert.isTrue(Arr.isBoundedLengthArray(1, 5, input));

    assert.isFalse(Arr.isBoundedLengthArray(1, 5, []));

    if (Arr.isBoundedLengthArray(1, 5, input)) {
      const selection: BoundedLengthArray<1, 5, number> = input;

      const relaxed: BoundedLengthArray<0, 100, number> = input; // OK ([1, 5] ⊆ [0, 100])

      assert.deepStrictEqual(selection[0], 1);

      assert.deepStrictEqual(relaxed.length, 3);
    }

    // curried version
    const isSmallSelection = Arr.isBoundedLengthArray(1, 5);

    assert.isTrue(isSmallSelection(input));

    // embed-sample-code-ignore-below
  });
}
