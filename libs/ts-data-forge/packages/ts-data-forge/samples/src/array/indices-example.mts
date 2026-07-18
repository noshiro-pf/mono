// Example: src/array/array-utils.mts (indices)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const items = ['zero', 'one', 'two'] as const;

    const indexList = Array.from(Arr.indices(items));

    assert.deepStrictEqual(indexList, [0, 1, 2]);

    // embed-sample-code-ignore-below
  });
}
