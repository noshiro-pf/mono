// Example: src/number/branded-types/uint.mts (Uint.mul)
import { Uint, asUint } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const product = Uint.mul(asUint(7), asUint(6));

    assert.isTrue(product === 42);
    // embed-sample-code-ignore-below
  });
}
