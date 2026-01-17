// Example: src/collections/iset.mts (delete)
import { ISet } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const base = ISet.create<number>([1, 2, 3]);

    const withoutTwo = base.delete(2);

    const unchanged = base.delete(4);

    assert.deepStrictEqual(Array.from(withoutTwo), [1, 3]);

    assert.isTrue(unchanged === base);

    // embed-sample-code-ignore-below
  });
}
