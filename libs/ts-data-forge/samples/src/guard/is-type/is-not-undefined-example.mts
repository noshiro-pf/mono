// Example: src/guard/is-type.mts (isNotUndefined)
import { isNotUndefined } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const values: (number | undefined)[] = [1, undefined, 2];

    const definedValues = values.filter(isNotUndefined);

    assert.deepStrictEqual(definedValues, [1, 2]);

    // embed-sample-code-ignore-below
  });
}
