// Example: src/string/str.mts (Str.isBoundedLengthString)
import { Str } from 'ts-data-forge';
import { type BoundedLengthString } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const input: string = 'user-12345678';

    assert.isTrue(Str.isBoundedLengthString(8, 16, input));

    assert.isFalse(Str.isBoundedLengthString(8, 16, 'user'));

    if (Str.isBoundedLengthString(8, 16, input)) {
      const userId: BoundedLengthString<1, 255> = input; // OK ([8, 16] ⊆ [1, 255])

      assert.isTrue(userId.length >= 8 && userId.length <= 16);
    }

    // embed-sample-code-ignore-below
  });
}
