// Example: src/number/branded-types/positive-safe-int.mts (PositiveSafeInt.min)
import { PositiveSafeInt, asPositiveSafeInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const smallest = PositiveSafeInt.min(
      asPositiveSafeInt(10),
      asPositiveSafeInt(5),
    );

    assert.isTrue(smallest === 5);

    // embed-sample-code-ignore-below
  });
}
