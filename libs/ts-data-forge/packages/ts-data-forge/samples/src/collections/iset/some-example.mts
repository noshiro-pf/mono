// Example: src/collections/iset.mts (some)
import { ISet } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const numbers = ISet.create([1, 3, 5]);

    assert.isTrue(numbers.some((value) => value > 4));

    assert.isFalse(numbers.some((value) => value > 10));

    // embed-sample-code-ignore-below
  });
}
