// Example: src/number/branded-types/positive-int.mts (PositiveInt.fromNumber)
import { PositiveInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const belowRange = PositiveInt.fromNumber(0);

    const withinRange = PositiveInt.fromNumber(10);

    assert.isTrue(belowRange === 1);

    assert.isTrue(withinRange === 10);

    // embed-sample-code-ignore-below
  });
}
