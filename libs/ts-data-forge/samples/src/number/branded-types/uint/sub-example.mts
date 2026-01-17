// Example: src/number/branded-types/uint.mts (Uint.sub)
import { Uint, asUint } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const difference = Uint.sub(asUint(5), asUint(8));

    assert.isTrue(difference === 0);

    // embed-sample-code-ignore-below
  });
}
