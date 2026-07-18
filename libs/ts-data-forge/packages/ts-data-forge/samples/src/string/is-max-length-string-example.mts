// Example: src/string/str.mts (Str.isMaxLengthString)
import { Str } from 'ts-data-forge';
import { type MaxLengthString } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const input: string = 'noshiro';

    assert.isTrue(Str.isMaxLengthString(input, 32));

    assert.isFalse(Str.isMaxLengthString(input, 3));

    if (Str.isMaxLengthString(input, 32)) {
      const relaxed: MaxLengthString<64> = input; // OK (32 <= 64)

      assert.isTrue(relaxed.length <= 32);
    }

    // embed-sample-code-ignore-below
  });
}
