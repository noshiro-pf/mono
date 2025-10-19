// Example: src/array/array-utils.mts (filter)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const numbers = [1, 2, 3, 4] as const;

const evens = Arr.filter(numbers, (value) => value % 2 === 0);
const greaterThanTwo = Arr.filter<number>((value) => value > 2)(numbers);

assert.deepStrictEqual(evens, [2, 4]);
assert.deepStrictEqual(greaterThanTwo, [3, 4]);
