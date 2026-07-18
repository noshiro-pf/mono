// Example: src/number/num.mts (Num.isPositive)
import { Num } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const amount = 42;

    if (Num.isPositive(amount)) {
      assert.isTrue(amount > 0);
    }

    assert.isFalse(Num.isPositive(0));

    // embed-sample-code-ignore-below
  });
}
