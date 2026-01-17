// Example: src/number/branded-types/safe-int.mts (SafeInt.add)
import { SafeInt, asSafeInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const sum = SafeInt.add(asSafeInt(9), asSafeInt(4));

    assert.isTrue(sum === 13);

    assert.isTrue(SafeInt.is(sum));

    // embed-sample-code-ignore-below
  });
}
