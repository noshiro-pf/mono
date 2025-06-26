import { range } from 'ts-data-forge';

// Traditional for loop using range
const values: number[] = [];
for (const i of range(0, 5)) {
  values.push(i);
}

assert.deepStrictEqual(values, [0, 1, 2, 3, 4]);

// Create arrays from ranges
const numbers = Array.from(range(1, 4)); // [1, 2, 3]
const squares = Array.from(range(1, 6), (x) => x * x); // [1, 4, 9, 16, 25]

assert.deepStrictEqual(numbers, [1, 2, 3]);
assert.deepStrictEqual(squares, [1, 4, 9, 16, 25]);

// Step ranges
const stepValues: number[] = [];
for (const i of range(0, 10, 2)) {
  stepValues.push(i);
}

assert.deepStrictEqual(stepValues, [0, 2, 4, 6, 8]);
