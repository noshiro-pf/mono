// Example: src/safe-string/normalize.mts (SafeString.normalize)
import { SafeString } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    // NFD decomposes U+00C5 into U+0041 + U+030A.
    assert.deepStrictEqual(SafeString.normalize('\u{C5}', 'NFD'), 'A\u{30A}');

    // embed-sample-code-ignore-below
  });
}
