// Example: src/number/branded-types/uint.mts (Uint.pow)
import { Uint, asUint } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const base = asUint(2);

    const exponent = asUint(5);

    const power = Uint.pow(base, exponent);

    assert.isTrue(power === 32);

    // embed-sample-code-ignore-below
  });
}
