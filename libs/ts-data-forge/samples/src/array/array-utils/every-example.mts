// Example: src/array/array-utils.mts (every)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const numbers = [2, 4, 6] as const;
const words = ['Ada', 'Grace'] as const;

const allEven = Arr.every(numbers, (value) => value % 2 === 0);
const allStartWithA = Arr.every(words, (value) => value.startsWith('A'));

assert.ok(allEven);
assert.notOk(allStartWithA);
