// Example: src/collections/iset.mts (values)
import { ISet } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const set = ISet.create(['x', 'y']);

    const values = Array.from(set.values());

    assert.deepStrictEqual(values, ['x', 'y']);

    // embed-sample-code-ignore-below
  });
}
