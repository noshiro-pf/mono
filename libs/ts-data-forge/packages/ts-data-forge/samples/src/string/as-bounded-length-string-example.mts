// Example: src/string/str.mts (Str.asBoundedLengthString)
import { Str } from 'ts-data-forge';
import { type BoundedLengthString } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const userId = Str.asBoundedLengthString('user-12345678', 8, 16);

    const relaxed: BoundedLengthString<1, 255> = userId; // OK ([8, 16] ⊆ [1, 255])

    assert.isTrue(relaxed.length >= 8 && relaxed.length <= 16);

    assert.throws(() => Str.asBoundedLengthString('user', 8, 16)); // length 4 < 8

    // embed-sample-code-ignore-below
  });
}
