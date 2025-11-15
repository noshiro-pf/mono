// Example: src/array/array-utils.mts (partition, chunk)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const values = [1, 2, 3, 4, 5] as const;

const pairs = Arr.partition(values, 2);

const triples = Arr.partition(3)(values);

const expectedPairs = [[1, 2], [3, 4], [5]] as const;

assert.deepStrictEqual(pairs, expectedPairs);

assert.deepStrictEqual(triples, [
  [1, 2, 3],
  [4, 5],
]);

const pairs2 = Arr.chunk([1, 2, 3, 4, 5, 6], 2);

assert.deepStrictEqual(pairs2, [
  [1, 2],
  [3, 4],
  [5, 6],
]);
