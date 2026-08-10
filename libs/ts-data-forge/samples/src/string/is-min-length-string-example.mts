// Example: src/string/str.mts (Str.isMinLengthString)
import { Str } from 'ts-data-forge';
import { type NonEmptyString } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const input: string = 'very-secret-password';

    assert.isTrue(Str.isMinLengthString(12, input));

    assert.isFalse(Str.isMinLengthString(12, 'short'));

    if (Str.isMinLengthString(12, input)) {
      const nonEmpty: NonEmptyString = input; // OK (12 >= 1)

      assert.isTrue(nonEmpty.length >= 12);
    }

    // embed-sample-code-ignore-below
  });
}
