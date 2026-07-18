// Example: src/array/array-utils.mts (toPushed)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const base = [1, 2] as const;

    const appended = Arr.toPushed(base, 3);

    const appendedCurried = Arr.toPushed(4)(base);

    assert.deepStrictEqual(appended, [1, 2, 3]);

    assert.deepStrictEqual(appendedCurried, [1, 2, 4]);

    // embed-sample-code-ignore-below
  });
}
