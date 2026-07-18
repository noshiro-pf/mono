// Example: src/number/num.mts (Num.isUintInRangeInclusive)
import { Num } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const inclusiveGuard = Num.isUintInRangeInclusive(0, 5);

    assert.isTrue(inclusiveGuard(5));

    assert.isFalse(inclusiveGuard(6));

    // embed-sample-code-ignore-below
  });
}
