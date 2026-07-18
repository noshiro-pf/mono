// Example: src/number/branded-types/positive-int.mts (asPositiveInt)
import { PositiveInt, asPositiveInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const branded = asPositiveInt(7);

    assert.isTrue(branded === 7);

    assert.isTrue(PositiveInt.is(branded));

    // embed-sample-code-ignore-below
  });
}
