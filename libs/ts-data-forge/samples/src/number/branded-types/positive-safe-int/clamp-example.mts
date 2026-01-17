// Example: src/number/branded-types/positive-safe-int.mts (PositiveSafeInt.clamp)
import { PositiveSafeInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const belowRange = PositiveSafeInt.clamp(0);

    const withinRange = PositiveSafeInt.clamp(123);

    const aboveRange = PositiveSafeInt.clamp(Number.MAX_SAFE_INTEGER + 10);

    assert.isTrue(belowRange === 1);

    assert.isTrue(withinRange === 123);

    assert.isTrue(aboveRange === Number.MAX_SAFE_INTEGER);

    // embed-sample-code-ignore-below
  });
}
