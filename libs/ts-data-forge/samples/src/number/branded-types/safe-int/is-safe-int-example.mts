// Example: src/number/branded-types/safe-int.mts (isSafeInt)
import { SafeInt, isSafeInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    assert.isTrue(isSafeInt(Number.MAX_SAFE_INTEGER));

    assert.isFalse(isSafeInt(Number.MAX_SAFE_INTEGER + 0.5));

    assert.isTrue(SafeInt.is(Number.MIN_SAFE_INTEGER));

    // embed-sample-code-ignore-below
  });
}
