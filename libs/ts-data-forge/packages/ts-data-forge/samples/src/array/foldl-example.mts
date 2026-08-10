// Example: src/array/array-utils.mts (foldl)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const words = ['Ada', 'Lovelace'] as const;

    const totalLength = Arr.foldl(words, (acc, word) => acc + word.length, 0);

    const concat = Arr.foldl<string | number, string>(
      (acc, value) => `${acc}-${value}`,
      'items',
    )(words);

    assert.isTrue(totalLength === 11);

    assert.isTrue(concat === 'items-Ada-Lovelace');

    // embed-sample-code-ignore-below
  });
}
