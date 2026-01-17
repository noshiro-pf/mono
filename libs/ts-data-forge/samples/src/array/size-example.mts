// Example: src/array/array-utils.mts (size)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const numbers = [1, 2, 3] as const;

    const letters: string[] = [];

    const sizeOfNumbers = Arr.size(numbers);

    const sizeOfLetters = Arr.size(letters);

    assert.isTrue(sizeOfNumbers === 3);

    assert.isTrue(sizeOfLetters === 0);

    // embed-sample-code-ignore-below
  });
}
