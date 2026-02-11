// Example: src/guard/is-type.mts (isNullish)
import { isNullish } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const values: readonly (string | null | undefined)[] = [
      'Ada',
      null,
      undefined,
    ] as const;

    const nullishValues = values.filter(isNullish);

    assert.deepStrictEqual(nullishValues, [null, undefined]);

    // embed-sample-code-ignore-below
  });
}
