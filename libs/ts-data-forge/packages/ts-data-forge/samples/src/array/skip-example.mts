// Example: src/array/array-utils.mts (skip)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const values = ['a', 'b', 'c', 'd'] as const;

    const withoutFirstTwo = Arr.skip(values, 2);

    const withoutFirstThree = Arr.skip(3)(values);

    assert.deepStrictEqual(withoutFirstTwo, ['c', 'd']);

    assert.deepStrictEqual(withoutFirstThree, ['d']);

    // embed-sample-code-ignore-below
  });
}
