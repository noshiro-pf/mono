// Example: src/number/branded-types/int.mts (isInt)
import { Int, isInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    assert.isTrue(isInt(5));

    assert.isFalse(isInt(5.25));

    assert.isTrue(Int.is(-10));

    // embed-sample-code-ignore-below
  });
}
