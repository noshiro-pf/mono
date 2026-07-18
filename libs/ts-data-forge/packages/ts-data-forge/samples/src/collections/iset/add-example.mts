// Example: src/collections/iset.mts (add)
import { ISet } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const base = ISet.create<number>([1, 2]);

    const withThree = base.add(3);

    const unchanged = base.add(2);

    assert.deepStrictEqual(Array.from(withThree), [1, 2, 3]);

    assert.isTrue(unchanged === base);

    // embed-sample-code-ignore-below
  });
}
