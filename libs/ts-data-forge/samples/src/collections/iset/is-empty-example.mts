// Example: src/collections/iset.mts (isEmpty)
import { ISet } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const emptySet = ISet.create<number>([]);

    const filledSet = ISet.create([1, 2]);

    assert.isTrue(emptySet.isEmpty);

    assert.isFalse(filledSet.isEmpty);

    // embed-sample-code-ignore-below
  });
}
