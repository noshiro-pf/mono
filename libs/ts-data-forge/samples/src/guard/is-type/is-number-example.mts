// Example: src/guard/is-type.mts (isNumber)
import { isNumber } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const mixed: readonly unknown[] = [1, '2', 3] as const;

    const numbers = mixed.filter(isNumber);

    assert.deepStrictEqual(numbers, [1, 3]);

    // embed-sample-code-ignore-below
  });
}
