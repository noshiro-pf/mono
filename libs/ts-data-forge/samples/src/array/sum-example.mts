// Example: src/array/array-utils.mts (sum)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const numbers = [1, 2, 3, 4] as const;

const negatives = [3, -2, 5] as const;

const total = Arr.sum(numbers);

const totalNegatives = Arr.sum(negatives);

assert(total === 10);

assert(totalNegatives === 6);
