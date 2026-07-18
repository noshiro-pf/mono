// Example: src/collections/iset.mts (ISet.equal)
import { ISet } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const first = ISet.create<number>([1, 2]);

    const second = ISet.create<number>([2, 1]);

    const third = ISet.create<number>([1, 3]);

    assert.isTrue(ISet.equal(first, second));

    assert.isFalse(ISet.equal(first, third));

    // embed-sample-code-ignore-below
  });
}
