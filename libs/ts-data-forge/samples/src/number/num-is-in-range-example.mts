// Example: src/number/num.mts (Num.isInRange)
import { Num } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const isGrade = Num.isInRange(0, 100);

    assert.isTrue(isGrade(50));

    assert.isFalse(isGrade(100));

    // embed-sample-code-ignore-below
  });
}
