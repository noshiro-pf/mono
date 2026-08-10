// Example: src/collections/iset.mts (ISet.intersection)
import { ISet } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const left = ISet.create<number>([1, 2, 3]);

    const right = ISet.create<number>([2, 4]);

    const overlap = ISet.intersection(left, right);

    assert.deepStrictEqual(Array.from(overlap), [2]);

    // embed-sample-code-ignore-below
  });
}
