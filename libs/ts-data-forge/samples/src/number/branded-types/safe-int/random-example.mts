// Example: src/number/branded-types/safe-int.mts (SafeInt.random)
import { SafeInt, asSafeInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const min = asSafeInt(-10);

    const max = asSafeInt(10);

    const randomValue = SafeInt.random(min, max);

    assert.isTrue(SafeInt.is(randomValue));

    assert.isTrue(-10 <= randomValue && randomValue <= 10);

    // embed-sample-code-ignore-below
  });
}
