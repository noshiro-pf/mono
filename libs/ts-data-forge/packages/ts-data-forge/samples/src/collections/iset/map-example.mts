// Example: src/collections/iset.mts (map)
import { ISet } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const letters = ISet.create(['a', 'b']);

    const upper = letters.map((value) => value.toUpperCase());

    assert.deepStrictEqual(Array.from(upper), ['A', 'B']);

    // embed-sample-code-ignore-below
  });
}
