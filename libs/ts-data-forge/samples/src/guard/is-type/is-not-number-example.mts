// Example: src/guard/is-type.mts (isNotNumber)
import { isNotNumber } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const mixed: readonly unknown[] = [1, '2', 3];

    const nonNumbers = mixed.filter(isNotNumber);

    assert.deepStrictEqual(nonNumbers, ['2']);

    // embed-sample-code-ignore-below
  });
}
