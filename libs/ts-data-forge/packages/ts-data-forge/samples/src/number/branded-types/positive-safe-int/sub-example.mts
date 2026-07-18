// Example: src/number/branded-types/positive-safe-int.mts (PositiveSafeInt.sub)
import { PositiveSafeInt, asPositiveSafeInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const difference = PositiveSafeInt.sub(
      asPositiveSafeInt(10),
      asPositiveSafeInt(20),
    );

    assert.isTrue(difference === 1);

    assert.isTrue(PositiveSafeInt.is(difference));

    // embed-sample-code-ignore-below
  });
}
