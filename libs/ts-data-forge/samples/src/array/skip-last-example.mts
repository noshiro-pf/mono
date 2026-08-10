// Example: src/array/array-utils.mts (skipLast)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const values = ['a', 'b', 'c', 'd'] as const;

    const withoutLastTwo = Arr.skipLast(values, 2);

    const withoutLastThree = Arr.skipLast(3)(values);

    assert.deepStrictEqual(withoutLastTwo, ['a', 'b']);

    assert.deepStrictEqual(withoutLastThree, ['a']);

    // embed-sample-code-ignore-below
  });
}
