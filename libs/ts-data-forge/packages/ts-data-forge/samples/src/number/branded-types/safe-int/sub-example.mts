// Example: src/number/branded-types/safe-int.mts (SafeInt.sub)
import { SafeInt, asSafeInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const difference = SafeInt.sub(asSafeInt(9), asSafeInt(14));

    assert.isTrue(difference === -5);

    assert.isTrue(SafeInt.is(difference));

    // embed-sample-code-ignore-below
  });
}
