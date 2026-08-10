// Example: src/guard/is-non-null-object.mts (isNonNullObject)
import { isNonNullObject } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const mixed: readonly unknown[] = [{ id: 1 }, null, 'Ada'] as const;

    const objects = mixed.filter(isNonNullObject);

    assert.deepStrictEqual(objects, [{ id: 1 }]);

    // embed-sample-code-ignore-below
  });
}
