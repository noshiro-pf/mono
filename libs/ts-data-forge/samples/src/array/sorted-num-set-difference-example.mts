// Example: src/array/array-utils.mts (sortedNumSetDifference)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const upcoming = [1, 3, 5, 7, 9] as const;

const completed = [3, 4, 7] as const;

const remaining = Arr.sortedNumSetDifference(upcoming, completed);

const expected = [1, 5, 9] as const;

assert.deepStrictEqual(remaining, expected);
