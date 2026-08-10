// Example: src/number/branded-types/safe-int.mts (SafeInt.div)
import { SafeInt, asSafeInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const quotient = SafeInt.div(asSafeInt(-17), asSafeInt(5));

    assert.isTrue(quotient === -4);

    assert.isTrue(SafeInt.is(quotient));

    // embed-sample-code-ignore-below
  });
}
