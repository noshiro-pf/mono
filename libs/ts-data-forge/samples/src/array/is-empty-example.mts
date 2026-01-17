// Example: src/array/array-utils.mts (isEmpty)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const emptyNumbers: readonly number[] = [] as const;

    const words = ['Ada', 'Lovelace'] as const;

    assert.isTrue(Arr.isEmpty(emptyNumbers));

    assert.isFalse(Arr.isEmpty(words));

    if (Arr.isEmpty(emptyNumbers)) {
      assert.deepStrictEqual(emptyNumbers, []);
    }

    // embed-sample-code-ignore-below
  });
}
