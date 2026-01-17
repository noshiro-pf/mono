// Example: src/number/num.mts (Num.isUintInRange)
import { Num } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const indexGuard = Num.isUintInRange(0, 5);

    assert.isTrue(indexGuard(3));

    assert.isFalse(indexGuard(5));

    assert.isFalse(indexGuard(-1));

    // embed-sample-code-ignore-below
  });
}
