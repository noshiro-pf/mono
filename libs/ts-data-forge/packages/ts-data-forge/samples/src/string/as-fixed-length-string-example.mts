// Example: src/string/str.mts (Str.asFixedLengthString)
import { Str } from 'ts-data-forge';
import { type MaxLengthString } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const countryCode = Str.asFixedLengthString('JP', 2);

    const atMost5: MaxLengthString<5> = countryCode; // OK (2 <= 5)

    assert.isTrue(atMost5.length === 2);

    assert.throws(() => Str.asFixedLengthString('JP', 3)); // length 2 !== 3

    // embed-sample-code-ignore-below
  });
}
