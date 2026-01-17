// Example: src/array/array-utils.mts (copy)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const original = [{ id: 1 }, { id: 2 }] as const;

    const cloned = Arr.copy(original);

    assert.deepStrictEqual(cloned, original);

    assert.notStrictEqual(cloned, original);

    // embed-sample-code-ignore-below
  });
}
