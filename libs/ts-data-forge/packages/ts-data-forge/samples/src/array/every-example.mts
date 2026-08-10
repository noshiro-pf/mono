// Example: src/array/array-utils.mts (every)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const numbers = [2, 4, 6] as const;

    const words = ['Ada', 'Grace'] as const;

    const allEven = Arr.every(numbers, (value) => value % 2 === 0);

    const allStartWithA = Arr.every(words, (value) => value.startsWith('A'));

    assert.isTrue(allEven);

    assert.isFalse(allStartWithA);

    // embed-sample-code-ignore-below
  });
}
