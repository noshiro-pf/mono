// Example: src/number/branded-types/positive-safe-int.mts (PositiveSafeInt.max)
import { PositiveSafeInt, asPositiveSafeInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const largest = PositiveSafeInt.max(
      asPositiveSafeInt(10),
      asPositiveSafeInt(5),
    );

    assert.isTrue(largest === 10);

    // embed-sample-code-ignore-below
  });
}
