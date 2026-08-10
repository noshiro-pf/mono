// Example: src/array/array-utils.mts (some)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const numbers = [1, 3, 5] as const;

    const words = ['Ada', 'Grace'] as const;

    const hasEven = Arr.some(numbers, (value) => value % 2 === 0);

    const hasShortName = Arr.some(words, (value) => value.length <= 3);

    assert.isFalse(hasEven);

    assert.isTrue(hasShortName);

    // embed-sample-code-ignore-below
  });
}
