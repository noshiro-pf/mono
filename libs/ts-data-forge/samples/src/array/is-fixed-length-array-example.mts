// Example: src/array/array-utils.mts (isFixedLengthArray)
import { Arr } from 'ts-data-forge';
import { type FixedLengthArray, type MaxLengthArray } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const input: readonly number[] = [255, 128, 0] as const;

    assert.isTrue(Arr.isFixedLengthArray(3, input));

    assert.isFalse(Arr.isFixedLengthArray(4, input));

    if (Arr.isFixedLengthArray(3, input)) {
      const rgb: FixedLengthArray<3, number> = input;

      const atMost5: MaxLengthArray<5, number> = input; // OK (3 <= 5)

      assert.deepStrictEqual(rgb[0], 255);

      assert.deepStrictEqual(atMost5.length, 3);
    }

    // curried version
    const isRgb = Arr.isFixedLengthArray(3);

    assert.isTrue(isRgb(input));

    // embed-sample-code-ignore-below
  });
}
