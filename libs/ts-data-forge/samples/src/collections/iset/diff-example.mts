// Example: src/collections/iset.mts (ISet.diff)
import { ISet } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const previous = ISet.create<string>(['draft', 'review']);

    const current = ISet.create<string>(['review', 'published']);

    const { added, deleted } = ISet.diff(previous, current);

    assert.deepStrictEqual(Array.from(added), ['published']);

    assert.deepStrictEqual(Array.from(deleted), ['draft']);

    // embed-sample-code-ignore-below
  });
}
