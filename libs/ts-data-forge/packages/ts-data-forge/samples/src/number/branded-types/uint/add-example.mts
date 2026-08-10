// Example: src/number/branded-types/uint.mts (Uint.add)
import { Uint, asUint } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const sum = Uint.add(asUint(5), asUint(8));

    assert.isTrue(sum === 13);

    // embed-sample-code-ignore-below
  });
}
