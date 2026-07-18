// Example: src/array/array-utils.mts (uniq)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const letters = ['a', 'b', 'a', 'c', 'b'] as const;

    const uniqueLetters = Arr.uniq(letters);

    const expected = ['a', 'b', 'c'] as const;

    assert.deepStrictEqual(uniqueLetters, expected);

    // embed-sample-code-ignore-below
  });
}
