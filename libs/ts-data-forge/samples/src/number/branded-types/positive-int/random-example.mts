// Example: src/number/branded-types/positive-int.mts (PositiveInt.random)
import { PositiveInt, asPositiveInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const min = asPositiveInt(3);

    const max = asPositiveInt(6);

    const randomValue = PositiveInt.random(min, max);

    assert.isTrue(PositiveInt.is(randomValue));

    assert.isTrue(randomValue >= 3 && randomValue <= 6);

    // embed-sample-code-ignore-below
  });
}
