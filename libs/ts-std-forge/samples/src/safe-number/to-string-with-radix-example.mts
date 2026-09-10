// Example: src/safe-number/to-string-with-radix.mts (SafeNumber.toStringWithRadix)
import { SafeNumber } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    assert.deepStrictEqual(SafeNumber.toStringWithRadix(255, 16), 'ff');

    // embed-sample-code-ignore-below
  });
}
