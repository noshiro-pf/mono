// Example: src/safe-number/to-exponential.mts (SafeNumber.toExponential)
import { SafeNumber } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    assert.deepStrictEqual(SafeNumber.toExponential(123456, 2), '1.23e+5');

    // embed-sample-code-ignore-below
  });
}
