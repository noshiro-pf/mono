// Example: src/number/branded-types/int.mts (Int.max)
import { Int, asInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const largest = Int.max(asInt(7), asInt(-3), asInt(2));

    assert.isTrue(largest === 7);

    // embed-sample-code-ignore-below
  });
}
