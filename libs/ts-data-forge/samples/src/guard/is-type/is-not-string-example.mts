// Example: src/guard/is-type.mts (isNotString)
import { isNotString } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const values: readonly unknown[] = ['Ada', 42, 'Lovelace'];

    const nonStrings = values.filter(isNotString);

    assert.deepStrictEqual(nonStrings, [42]);

    // embed-sample-code-ignore-below
  });
}
