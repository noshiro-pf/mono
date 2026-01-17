// Example: src/collections/iset.mts (has)
import { ISet } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const set = ISet.create(['apple', 'banana']);

    assert.isTrue(set.has('apple'));

    assert.isFalse(set.has('cherry'));

    // embed-sample-code-ignore-below
  });
}
