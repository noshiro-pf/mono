// Example: src/array/array-utils.mts (isMaxLengthArray)
import { Arr } from 'ts-data-forge';
import { type MaxLengthArray } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const input: readonly string[] = ['a', 'b', 'c'] as const;

    assert.isTrue(Arr.isMaxLengthArray(8, input));

    assert.isFalse(Arr.isMaxLengthArray(2, input));

    if (Arr.isMaxLengthArray(8, input)) {
      const tags: MaxLengthArray<8, string> = input;

      const relaxed: MaxLengthArray<16, string> = input; // OK (8 <= 16)

      assert.deepStrictEqual(tags.length, 3);

      assert.deepStrictEqual(relaxed.length, 3);
    }

    // curried version
    const fitsInEight = Arr.isMaxLengthArray(8);

    assert.isTrue(fitsInEight(input));

    // embed-sample-code-ignore-below
  });
}
