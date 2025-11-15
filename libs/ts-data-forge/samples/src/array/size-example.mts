// Example: src/array/array-utils.mts (size)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const numbers = [1, 2, 3] as const;

const letters: string[] = [];

const sizeOfNumbers = Arr.size(numbers);

const sizeOfLetters = Arr.size(letters);

assert(sizeOfNumbers === 3);

assert(sizeOfLetters === 0);
