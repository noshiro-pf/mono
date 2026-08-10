// Example: src/guard/is-type.mts (isNotBigint)
import { isNotBigint } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const values: readonly unknown[] = [1n, 2, 3n] as const;

    const nonBigints = values.filter(isNotBigint);

    assert.deepStrictEqual(nonBigints, [2]);

    // embed-sample-code-ignore-below
  });
}
