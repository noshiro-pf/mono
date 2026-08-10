// Example: src/number/branded-types/positive-int.mts (PositiveInt.add)
import { PositiveInt, asPositiveInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const sum = PositiveInt.add(asPositiveInt(4), asPositiveInt(5));

    assert.isTrue(sum === 9);

    // embed-sample-code-ignore-below
  });
}
