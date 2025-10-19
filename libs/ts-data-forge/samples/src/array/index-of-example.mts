// Example: src/array/impl/array-utils-search.mts (indexOf)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const fruits = ['apple', 'banana', 'orange', 'banana'];

const indexOfBanana = Arr.indexOf(fruits, 'banana');
const indexOfGrape = Arr.indexOf(fruits, 'grape');

// Curried version
const findApple = Arr.indexOf('apple');
const indexOfApple = findApple(fruits);

console.log(indexOfBanana); // => 1
console.log(indexOfGrape); // => -1
console.log(indexOfApple); // => 0
