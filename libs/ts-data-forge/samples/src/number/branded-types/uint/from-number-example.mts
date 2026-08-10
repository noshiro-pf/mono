// Example: src/number/branded-types/uint.mts (Uint.fromNumber)
import { Uint } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const fromNegative = Uint.fromNumber(-5);

    const fromPositive = Uint.fromNumber(42);

    assert.isTrue(fromNegative === 0);

    assert.isTrue(fromPositive === 42);

    // embed-sample-code-ignore-below
  });
}
