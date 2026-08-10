// Example: src/collections/iset.mts (isSubsetOf)
import { ISet } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const subset = ISet.create<number>([1, 2]);

    const superset = ISet.create<number>([1, 2, 3]);

    assert.isTrue(subset.isSubsetOf(superset));

    assert.isFalse(superset.isSubsetOf(subset));

    // embed-sample-code-ignore-below
  });
}
