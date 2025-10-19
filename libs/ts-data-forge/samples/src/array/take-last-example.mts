// Example: src/array/array-utils.mts (takeLast)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const values = [1, 2, 3, 4];

const lastTwo = Arr.takeLast(values, 2);
const lastThree = Arr.takeLast(3)(values);

assert.deepStrictEqual(lastTwo, [3, 4]);
assert.deepStrictEqual(lastThree, [2, 3, 4]);
