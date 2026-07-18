// Example: src/guard/is-type.mts (isString)
import { isString } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const values: readonly unknown[] = ['Ada', 42, 'Lovelace'] as const;

    const strings = values.filter(isString);

    assert.deepStrictEqual(strings, ['Ada', 'Lovelace']);

    // embed-sample-code-ignore-below
  });
}
