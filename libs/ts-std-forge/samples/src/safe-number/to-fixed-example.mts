// Example: src/safe-number/to-fixed.mts (SafeNumber.toFixed)
import { SafeNumber } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    assert.deepStrictEqual(SafeNumber.toFixed(1.005, 2), '1.00');

    // embed-sample-code-ignore-below
  });
}
