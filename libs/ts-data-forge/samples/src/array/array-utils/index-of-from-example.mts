// Example: src/array/impl/array-utils-search.mts (indexOfFrom)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const fruits = ['apple', 'banana', 'orange', 'banana'];

// Search for 'banana' starting from index 1
const firstBanana = Arr.indexOfFrom(fruits, 'banana', 1);
// Search for 'banana' starting from index 2
const secondBanana = Arr.indexOfFrom(fruits, 'banana', 2);
// Element not found
const notFound = Arr.indexOfFrom(fruits, 'grape', 0);

// Curried version
const findBananaFrom2 = Arr.indexOfFrom('banana', 2);
const index = findBananaFrom2(fruits);

console.log(firstBanana); // => 1
console.log(secondBanana); // => 3
console.log(notFound); // => -1
console.log(index); // => 3
