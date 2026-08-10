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
      // `isEmpty` narrows to the branded `FixedLengthArray<0, number>`, so the
      // expected value is annotated with the unbranded type.
      assert.deepStrictEqual<readonly number[]>(emptyNumbers, []);
    }

    // embed-sample-code-ignore-below
  });
}
