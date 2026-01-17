// Example: src/number/branded-types/positive-int.mts (PositiveInt.min)
import { PositiveInt, asPositiveInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const smallest = PositiveInt.min(
      asPositiveInt(9),
      asPositiveInt(3),
      asPositiveInt(12),
    );

    assert.isTrue(smallest === 3);

    // embed-sample-code-ignore-below
  });
}
