// Example: src/number/branded-types/positive-safe-int.mts (PositiveSafeInt.random)
import { PositiveSafeInt, asPositiveSafeInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const min = asPositiveSafeInt(1);

    const max = asPositiveSafeInt(6);

    const randomValue = PositiveSafeInt.random(min, max);

    assert.isTrue(PositiveSafeInt.is(randomValue));

    assert.isTrue(randomValue >= 1 && randomValue <= 6);

    // embed-sample-code-ignore-below
  });
}
