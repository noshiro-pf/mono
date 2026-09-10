// Example: src/safe-array/is-non-empty.mts (SafeArray.isNonEmpty)
import { SafeArray } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const values: readonly number[] = [1, 2] as const;

    assert.isTrue(SafeArray.isNonEmpty(values));

    assert.isFalse(SafeArray.isNonEmpty([] as const));

    if (SafeArray.isNonEmpty(values)) {
      // `values[0]` is `number`, not `number | undefined`.
      assert.strictEqual(values[0], 1);
    }

    // embed-sample-code-ignore-below
  });
}
