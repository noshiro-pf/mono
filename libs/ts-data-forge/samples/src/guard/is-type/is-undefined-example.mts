// Example: src/guard/is-type.mts (isUndefined)
import { isUndefined } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const values: readonly (number | undefined)[] = [1, undefined, 2] as const;

    const undefinedValues = values.filter(isUndefined);

    assert.deepStrictEqual(undefinedValues, [undefined]);

    // embed-sample-code-ignore-below
  });
}
