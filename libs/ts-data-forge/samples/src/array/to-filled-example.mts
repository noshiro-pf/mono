// Example: src/array/array-utils.mts (toFilled)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const base = [1, 2, 3] as const;

    const filled = Arr.toFilled(base, 0);

    const filledCurried = Arr.toFilled('x')(base);

    assert.deepStrictEqual(filled, [0, 0, 0]);

    assert.deepStrictEqual(filledCurried, ['x', 'x', 'x']);

    // embed-sample-code-ignore-below
  });
}
