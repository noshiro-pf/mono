// Example: src/array/array-utils.mts (toReversed)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const tuple = [1, 'two', true] as const;

    const reversed = Arr.toReversed(tuple);

    const expected = [true, 'two', 1] as const;

    assert.deepStrictEqual(reversed, expected);

    // embed-sample-code-ignore-below
  });
}
