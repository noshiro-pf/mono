// Example: src/safe-array/is-empty.mts (SafeArray.isEmpty)
import { SafeArray } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const values: readonly number[] = [] as const;

    assert.isTrue(SafeArray.isEmpty(values));

    assert.isFalse(SafeArray.isEmpty([1] as const));

    // embed-sample-code-ignore-below
  });
}
