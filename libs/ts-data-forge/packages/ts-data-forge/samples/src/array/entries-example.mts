// Example: src/array/array-utils.mts (entries)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const tags = ['alpha', 'beta', 'gamma'] as const;

    const entryList = Array.from(
      Arr.entries(tags),
      ([index, tag]) => [Number(index), tag] as const,
    );

    assert.deepStrictEqual(
      entryList,
      Array.from([
        [0, 'alpha'],
        [1, 'beta'],
        [2, 'gamma'],
      ]),
    );

    // embed-sample-code-ignore-below
  });
}
