// Example: src/string/str.mts (Str.asMinLengthString)
import { Str } from 'ts-data-forge';
import { type NonEmptyString } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const password = Str.asMinLengthString('very-secret-password', 12);

    const nonEmpty: NonEmptyString = password; // OK (>= 1)

    assert.isTrue(nonEmpty.length >= 12);

    // curried version
    const asPassword = Str.asMinLengthString(12);

    assert.strictEqual(asPassword('another-secret'), 'another-secret');

    assert.throws(() => Str.asMinLengthString('short', 12)); // length 5 < 12

    // embed-sample-code-ignore-below
  });
}
