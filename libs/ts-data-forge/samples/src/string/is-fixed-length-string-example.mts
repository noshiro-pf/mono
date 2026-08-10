// Example: src/string/str.mts (Str.isFixedLengthString)
import { Str } from 'ts-data-forge';
import { type MaxLengthString } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const input: string = 'JP';

    assert.isTrue(Str.isFixedLengthString(2, input));

    assert.isFalse(Str.isFixedLengthString(3, input));

    if (Str.isFixedLengthString(2, input)) {
      const atMost5: MaxLengthString<5> = input; // OK (2 <= 5)

      assert.isTrue(atMost5.length === 2);
    }

    // embed-sample-code-ignore-below
  });
}
