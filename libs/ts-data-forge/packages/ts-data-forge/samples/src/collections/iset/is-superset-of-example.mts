// Example: src/collections/iset.mts (isSupersetOf)
import { ISet } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const superset = ISet.create<string>(['a', 'b', 'c']);

    const subset = ISet.create<string>(['a', 'c']);

    assert.isTrue(superset.isSupersetOf(subset));

    assert.isFalse(subset.isSupersetOf(superset));

    // embed-sample-code-ignore-below
  });
}
