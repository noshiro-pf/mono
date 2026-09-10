// Example: src/safe-array/is-array.mts (SafeArray.isArray)
import { SafeArray } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const maybeArray: unknown = [1, 2, 3] as const;

    const maybeValue: unknown = 'Ada';

    assert.isTrue(SafeArray.isArray(maybeArray));

    assert.isFalse(SafeArray.isArray(maybeValue));

    if (SafeArray.isArray(maybeArray)) {
      assert.deepStrictEqual(maybeArray, [1, 2, 3]);
    }

    // embed-sample-code-ignore-below
  });
}
