// Example: src/string/str.mts (Str.asMaxLengthString)
import { Str } from 'ts-data-forge';
import { type MaxLengthString } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const userName = Str.asMaxLengthString('noshiro', 32);

    const relaxed: MaxLengthString<64> = userName; // OK (32 <= 64)

    assert.isTrue(relaxed.length <= 32);

    // curried version
    const asUserName = Str.asMaxLengthString(32);

    assert.strictEqual(asUserName('another-user'), 'another-user');

    assert.throws(() => Str.asMaxLengthString('noshiro', 3)); // length 7 > 3

    // embed-sample-code-ignore-below
  });
}
