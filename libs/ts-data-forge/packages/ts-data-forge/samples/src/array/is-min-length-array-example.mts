// Example: src/array/array-utils.mts (isMinLengthArray)
import { Arr } from 'ts-data-forge';
import { type MinLengthArray } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const input: readonly number[] = [0, 1, 2, 3] as const;

    assert.isTrue(Arr.isMinLengthArray(3, input));

    assert.isFalse(Arr.isMinLengthArray(3, [0]));

    if (Arr.isMinLengthArray(3, input)) {
      const history: MinLengthArray<3, number> = input;

      const nonEmpty: MinLengthArray<1, number> = input; // OK (3 >= 1)

      assert.deepStrictEqual(history[0], 0);

      assert.deepStrictEqual(nonEmpty[0], 0);
    }

    // curried version
    const hasThree = Arr.isMinLengthArray(3);

    assert.isTrue(hasThree(input));

    // embed-sample-code-ignore-below
  });
}
