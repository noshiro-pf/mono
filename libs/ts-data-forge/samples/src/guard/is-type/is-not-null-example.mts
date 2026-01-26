// Example: src/guard/is-type.mts (isNotNull)
import { isNotNull } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const values: readonly (number | null)[] = [null, 5];

    const nonNullValues = values.filter(isNotNull);

    assert.deepStrictEqual(nonNullValues, [5]);

    // embed-sample-code-ignore-below
  });
}
