// Example: src/safe-number/to-precision.mts (SafeNumber.toPrecision)
import { SafeNumber } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    assert.deepStrictEqual(SafeNumber.toPrecision(123.456, 4), '123.5');

    // embed-sample-code-ignore-below
  });
}
