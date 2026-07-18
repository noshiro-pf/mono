// Example: src/string/str.mts (Str.isBoundedLengthString)
import { Str } from 'ts-data-forge';
import { type BoundedLengthString } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const input: string = 'user-12345678';

    assert.isTrue(Str.isBoundedLengthString(input, 8, 16));

    assert.isFalse(Str.isBoundedLengthString('user', 8, 16));

    if (Str.isBoundedLengthString(input, 8, 16)) {
      const userId: BoundedLengthString<1, 255> = input; // OK ([8, 16] ⊆ [1, 255])

      assert.isTrue(userId.length >= 8 && userId.length <= 16);
    }

    // embed-sample-code-ignore-below
  });
}
