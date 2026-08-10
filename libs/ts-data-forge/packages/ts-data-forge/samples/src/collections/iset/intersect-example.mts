// Example: src/collections/iset.mts (intersect)
import { ISet } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const left = ISet.create<string>(['x', 'y']);

    const right = ISet.create<string>(['y', 'z']);

    const shared = left.intersect(right);

    assert.deepStrictEqual(Array.from(shared), ['y']);

    // embed-sample-code-ignore-below
  });
}
