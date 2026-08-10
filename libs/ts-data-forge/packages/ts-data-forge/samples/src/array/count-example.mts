// Example: src/array/array-utils.mts (count)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const words = ['Ada', 'Grace', 'Linus'] as const;

    const longWords = Arr.count(words, (word) => word.length > 4);

    const withCurried = Arr.count<string>((word) => word.includes('a'))(words);

    assert.isTrue(longWords === 2);

    assert.isTrue(withCurried === 2);

    // embed-sample-code-ignore-below
  });
}
