// Example: src/array/array-utils.mts (sliceClamped)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const letters = ['a', 'b', 'c', 'd', 'e'];

const lastThree = Arr.sliceClamped(letters, -3, 10);
const middleTwo = Arr.sliceClamped(1, 3)(letters);

assert.deepStrictEqual(lastThree, ['a', 'b', 'c', 'd', 'e']);
assert.deepStrictEqual(middleTwo, ['b', 'c']);
