// Example: src/array/array-utils.mts (toRemoved)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const letters = ['a', 'b', 'c', 'd'] as const;

    const withoutSecond = Arr.toRemoved(letters, 1);

    const withoutFirstCurried = Arr.toRemoved(0)(letters);

    assert.deepStrictEqual(withoutSecond, ['a', 'c', 'd']);

    assert.deepStrictEqual(withoutFirstCurried, ['b', 'c', 'd']);

    // embed-sample-code-ignore-below
  });
}
