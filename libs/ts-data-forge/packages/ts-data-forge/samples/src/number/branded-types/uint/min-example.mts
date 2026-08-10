// Example: src/number/branded-types/uint.mts (Uint.min)
import { Uint, asUint } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const smallest = Uint.min(asUint(7), asUint(3));

    assert.isTrue(smallest === 3);

    // embed-sample-code-ignore-below
  });
}
