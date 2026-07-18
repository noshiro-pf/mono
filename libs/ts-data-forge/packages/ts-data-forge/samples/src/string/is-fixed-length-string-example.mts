// Example: src/string/str.mts (Str.isFixedLengthString)
import { Str } from 'ts-data-forge';
import { type MaxLengthString } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const input: string = 'JP';

    assert.isTrue(Str.isFixedLengthString(input, 2));

    assert.isFalse(Str.isFixedLengthString(input, 3));

    if (Str.isFixedLengthString(input, 2)) {
      const atMost5: MaxLengthString<5> = input; // OK (2 <= 5)

      assert.isTrue(atMost5.length === 2);
    }

    // embed-sample-code-ignore-below
  });
}
