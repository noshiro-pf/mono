// Example: src/guard/is-type.mts (isBigint)
import { isBigint } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const values: readonly unknown[] = [1n, 2, 3n] as const;

    const bigints = values.filter(isBigint);

    assert.deepStrictEqual(bigints, [1n, 3n]);

    // embed-sample-code-ignore-below
  });
}
