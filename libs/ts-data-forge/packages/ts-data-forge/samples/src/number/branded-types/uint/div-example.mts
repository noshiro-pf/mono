// Example: src/number/branded-types/uint.mts (Uint.div)
import { Uint, asUint } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const quotient = Uint.div(asUint(10), asUint(4));

    assert.isTrue(quotient === 2);

    // embed-sample-code-ignore-below
  });
}
