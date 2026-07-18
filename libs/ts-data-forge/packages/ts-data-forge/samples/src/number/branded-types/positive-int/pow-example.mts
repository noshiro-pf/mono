// Example: src/number/branded-types/positive-int.mts (PositiveInt.pow)
import { PositiveInt, asPositiveInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const base = asPositiveInt(2);

    const exponent = asPositiveInt(4);

    const power = PositiveInt.pow(base, exponent);

    assert.isTrue(power === 16);

    // embed-sample-code-ignore-below
  });
}
