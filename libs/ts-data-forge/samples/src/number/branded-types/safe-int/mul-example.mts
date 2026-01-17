// Example: src/number/branded-types/safe-int.mts (SafeInt.mul)
import { SafeInt, asSafeInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const product = SafeInt.mul(asSafeInt(-8), asSafeInt(7));

    assert.isTrue(product === -56);

    assert.isTrue(SafeInt.is(product));

    // embed-sample-code-ignore-below
  });
}
