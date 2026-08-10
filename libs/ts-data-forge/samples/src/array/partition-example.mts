// Example: src/array/array-utils.mts (partition, chunk)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const values = [1, 2, 3, 4, 5] as const;

    const pairs = Arr.partition(values, 2);

    const triples = Arr.partition(3)(values);

    // Every chunk is branded `BoundedLengthArray<1, N, …>` — `partition` never
    // emits an empty chunk — so the expected values are annotated with the
    // unbranded type.
    const expectedPairs = [[1, 2], [3, 4], [5]] as const;

    assert.deepStrictEqual<readonly (readonly number[])[]>(
      pairs,
      expectedPairs,
    );

    assert.deepStrictEqual<readonly (readonly number[])[]>(triples, [
      [1, 2, 3],
      [4, 5],
    ]);

    const pairs2 = Arr.chunk([1, 2, 3, 4, 5, 6], 2);

    assert.deepStrictEqual<readonly (readonly number[])[]>(pairs2, [
      [1, 2],
      [3, 4],
      [5, 6],
    ]);

    // embed-sample-code-ignore-below
  });
}
