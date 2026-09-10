// Example: src/array/array-utils.mts (asFixedLengthArray)
import { Arr } from 'ts-data-forge';
import { type MaxLengthArray } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const rgb = Arr.asFixedLengthArray(3, [255, 128, 0]);

    const atMost5: MaxLengthArray<5, number> = rgb; // OK (3 <= 5)

    const red: number = rgb[0]; // OK — no `undefined`

    // curried version
    const asRgb = Arr.asFixedLengthArray(3);

    const green = asRgb([0, 255, 0]);

    assert.deepStrictEqual(Array.from(atMost5), [255, 128, 0]);

    assert.strictEqual(red, 255);

    assert.deepStrictEqual(green, [0, 255, 0]);

    assert.throws(() => Arr.asFixedLengthArray(3, [255, 128]), TypeError);

    // embed-sample-code-ignore-below
  });
}
