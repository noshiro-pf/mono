// Example: src/number/branded-types/int.mts (Int.pow)
import { Int, asInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const base = asInt(2);

    const exponent = asInt(5);

    const power = Int.pow(base, exponent);

    assert.isTrue(power === 32);

    // embed-sample-code-ignore-below
  });
}
