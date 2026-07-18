// Example: src/collections/iset.mts (entries)
import { ISet } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const set = ISet.create(['red', 'blue']);

    const entries = Array.from(set.entries());

    assert.deepStrictEqual(entries, [
      ['red', 'red'],
      ['blue', 'blue'],
    ]);

    // embed-sample-code-ignore-below
  });
}
