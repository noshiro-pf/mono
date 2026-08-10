// Example: src/number/branded-types/safe-int.mts (SafeInt.max)
import { SafeInt, asSafeInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const largest = SafeInt.max(asSafeInt(25), asSafeInt(-14), asSafeInt(99));

    assert.isTrue(largest === 99);

    // embed-sample-code-ignore-below
  });
}
