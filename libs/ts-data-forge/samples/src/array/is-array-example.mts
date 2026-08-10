// Example: src/array/array-utils.mts (isArray)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const maybeArray: unknown = [1, 2, 3] as const;

    const maybeValue: unknown = 'Ada';

    assert.isTrue(Arr.isArray(maybeArray));

    assert.isFalse(Arr.isArray(maybeValue));

    if (Arr.isArray(maybeArray)) {
      assert.deepStrictEqual(maybeArray, [1, 2, 3]);
    }

    // embed-sample-code-ignore-below
  });
}
