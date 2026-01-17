// Example: src/array/array-utils.mts (flatMap)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const words = ['Ada', 'AI'] as const;

    const characters = Arr.flatMap(words, (word) => word.split(''));

    const labeled = Arr.flatMap<string, string>((word, index) =>
      word.split('').map((char) => `${index}-${char}`),
    )(words);

    assert.deepStrictEqual(characters, ['A', 'd', 'a', 'A', 'I']);

    assert.deepStrictEqual(labeled, ['0-A', '0-d', '0-a', '1-A', '1-I']);

    // embed-sample-code-ignore-below
  });
}
