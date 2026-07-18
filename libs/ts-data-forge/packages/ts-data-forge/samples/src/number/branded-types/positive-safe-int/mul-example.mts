// Example: src/number/branded-types/positive-safe-int.mts (PositiveSafeInt.mul)
import { PositiveSafeInt, asPositiveSafeInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const product = PositiveSafeInt.mul(
      asPositiveSafeInt(50),
      asPositiveSafeInt(20),
    );

    assert.isTrue(product === 1000);

    assert.isTrue(PositiveSafeInt.is(product));

    // embed-sample-code-ignore-below
  });
}
