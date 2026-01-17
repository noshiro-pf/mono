// Example: src/number/branded-types/uint.mts (Uint.max)
import { Uint, asUint } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const largest = Uint.max(asUint(7), asUint(3));

    assert.isTrue(largest === 7);

    // embed-sample-code-ignore-below
  });
}
