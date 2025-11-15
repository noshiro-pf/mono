// Example: src/array/impl/array-utils-search.mts (lastIndexOfFrom)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const fruits = ['apple', 'banana', 'orange', 'banana', 'grape'];

// Search backwards for 'banana' from index 3
const lastBananaFrom3 = Arr.lastIndexOfFrom(fruits, 'banana', 3);

// Search backwards for 'banana' from index 2
const lastBananaFrom2 = Arr.lastIndexOfFrom(fruits, 'banana', 2);

// Element not found
const notFound = Arr.lastIndexOfFrom(fruits, 'grape', 2);

// Curried version
const findBananaFrom3 = Arr.lastIndexOfFrom('banana', 3);

const index = findBananaFrom3(fruits);

console.log(lastBananaFrom3); // => 3

console.log(lastBananaFrom2); // => 1

console.log(notFound); // => -1

console.log(index); // => 3
