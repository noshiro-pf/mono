// Example: src/number/branded-types/positive-int.mts (PositiveInt.clamp)
import { PositiveInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const belowRange = PositiveInt.clamp(0);

    const withinRange = PositiveInt.clamp(10);

    assert.isTrue(belowRange === 1);

    assert.isTrue(withinRange === 10);

    // embed-sample-code-ignore-below
  });
}
