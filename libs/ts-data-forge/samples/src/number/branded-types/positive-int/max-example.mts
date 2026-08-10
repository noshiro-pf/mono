// Example: src/number/branded-types/positive-int.mts (PositiveInt.max)
import { PositiveInt, asPositiveInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const largest = PositiveInt.max(
      asPositiveInt(9),
      asPositiveInt(3),
      asPositiveInt(12),
    );

    assert.isTrue(largest === 12);

    // embed-sample-code-ignore-below
  });
}
