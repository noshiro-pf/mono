// Example: src/array/array-utils.mts (seq)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const emptySeq = Arr.seq(0);

    const firstFive = Arr.seq(5);

    assert.deepStrictEqual(emptySeq, []);

    assert.deepStrictEqual(firstFive, [0, 1, 2, 3, 4]);

    // embed-sample-code-ignore-below
  });
}
