// Example: src/array/array-utils.mts (take)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const values = [1, 2, 3, 4];

const firstTwo = Arr.take(values, 2);
const firstThree = Arr.take(3)(values);

assert.deepStrictEqual(firstTwo, [1, 2]);
assert.deepStrictEqual(firstThree, [1, 2, 3]);
