// Example: src/number/num.mts (Num.clamp)
import { Num } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    assert.isTrue(Num.clamp(150, 0, 100) === 100);

    assert.isTrue(Num.clamp(-50, 0, 100) === 0);

    const clampToPercentage = Num.clamp(0, 100);

    assert.isTrue(clampToPercentage(75) === 75);

    assert.isTrue(clampToPercentage(150) === 100);

    // embed-sample-code-ignore-below
  });
}
