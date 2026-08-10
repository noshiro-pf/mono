// Example: src/number/branded-types/positive-int.mts (PositiveInt.mul)
import { PositiveInt, asPositiveInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const product = PositiveInt.mul(asPositiveInt(3), asPositiveInt(7));

    assert.isTrue(product === 21);

    // embed-sample-code-ignore-below
  });
}
