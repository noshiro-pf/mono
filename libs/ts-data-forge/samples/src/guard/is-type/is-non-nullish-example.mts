// Example: src/guard/is-type.mts (isNonNullish)
import { isNonNullish } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const values: (string | null | undefined)[] = ['Ada', null, undefined];

    const definedValues = values.filter(isNonNullish);

    assert.deepStrictEqual(definedValues, ['Ada']);

    // embed-sample-code-ignore-below
  });
}
