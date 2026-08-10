// Example: src/number/branded-types/uint.mts (Uint.random)
import { Uint, asUint } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const min = asUint(0);

    const max = asUint(3);

    const randomValue = Uint.random(min, max);

    assert.isTrue(Uint.is(randomValue));

    assert.isTrue(randomValue >= 0 && randomValue <= 3);

    // embed-sample-code-ignore-below
  });
}
