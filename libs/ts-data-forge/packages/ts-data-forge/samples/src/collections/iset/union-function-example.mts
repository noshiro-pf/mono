// Example: src/collections/iset.mts (ISet.union)
import { ISet } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const numbers = ISet.create([1, 2]);

    const words = ISet.create(['one', 'two']);

    const union = ISet.union(numbers, words);

    assert.deepStrictEqual(Array.from(union), [1, 2, 'one', 'two']);

    // embed-sample-code-ignore-below
  });
}
