// Example: src/number/branded-types/positive-int.mts (PositiveInt.sub)
import { PositiveInt, asPositiveInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const difference = PositiveInt.sub(asPositiveInt(5), asPositiveInt(7));

    assert.isTrue(difference === 1);

    // embed-sample-code-ignore-below
  });
}
