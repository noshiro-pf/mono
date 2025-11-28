// Example: src/array/array-utils.mts (isArrayOfLength)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const pair: readonly number[] = [1, 2];

const triple: readonly number[] = [1, 2, 3];

assert.isTrue(Arr.isArrayOfLength(pair, 2));

assert.isFalse(Arr.isArrayOfLength(triple, 2));

if (Arr.isArrayOfLength(pair, 2)) {
  assert.deepStrictEqual(pair, [1, 2]);
}
