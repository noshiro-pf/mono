// Example: src/array/array-utils.mts (toInserted)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const numbers = [1, 2, 4] as const;

const withThree = Arr.toInserted(numbers, 2, 3);
const appendFive = Arr.toInserted(3, 5)(numbers);

assert.deepStrictEqual(withThree, [1, 2, 3, 4]);
assert.deepStrictEqual(appendFive, [1, 2, 4, 5]);
