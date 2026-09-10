// Example: src/array/array-utils.mts (asFixedLengthTuple)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const rgb = Arr.asFixedLengthTuple(3, [255, 128, 0]);

    const red: number = rgb[0]; // OK — no `undefined`

    // curried version
    const asRgb = Arr.asFixedLengthTuple(3);

    assert.strictEqual(red, 255);

    assert.deepStrictEqual(asRgb([0, 255, 0]), [0, 255, 0]);

    assert.throws(() => Arr.asFixedLengthTuple(3, [255, 128]), TypeError);

    // embed-sample-code-ignore-below
  });
}
