// Example: src/array/array-utils.mts (toSorted)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const numbers = [3, 1, 2] as const;

const words = ['banana', 'apple', 'cherry'] as const;

const ascendingNumbers = Arr.toSorted(numbers);

const alphabetical = Arr.toSorted(words, (left, right) =>
  left.localeCompare(right),
);

const expectedNumbers = [1, 2, 3] as const;

const expectedWords = ['apple', 'banana', 'cherry'] as const;

assert.deepStrictEqual(ascendingNumbers, expectedNumbers);

assert.deepStrictEqual(alphabetical, expectedWords);
