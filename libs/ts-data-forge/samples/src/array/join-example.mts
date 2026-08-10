// Example: src/array/array-utils.mts (join)
import { Arr, Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const numbers = [1, 2, 3] as const;

    const defaultSeparator = Arr.join(numbers);

    const hyphenSeparated = Arr.join(numbers, '-');

    assert.deepStrictEqual(defaultSeparator, Result.ok('1,2,3'));

    assert.deepStrictEqual(hyphenSeparated, Result.ok('1-2-3'));

    // embed-sample-code-ignore-below
  });
}
