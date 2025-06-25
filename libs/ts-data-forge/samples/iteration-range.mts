import { range } from 'ts-data-forge';

// Traditional for loop using range
if (import.meta.vitest !== undefined) {
  const values: number[] = [];
  for (const i of range(0, 5)) {
    values.push(i);
  }
  expect(values).toStrictEqual([0, 1, 2, 3, 4]);
}

// Create arrays from ranges
const numbers = Array.from(range(1, 4)); // [1, 2, 3]
const squares = Array.from(range(1, 6), (x) => x * x); // [1, 4, 9, 16, 25]

if (import.meta.vitest !== undefined) {
  expect(numbers).toStrictEqual([1, 2, 3]);
  expect(squares).toStrictEqual([1, 4, 9, 16, 25]);
}

// Step ranges
if (import.meta.vitest !== undefined) {
  const stepValues: number[] = [];
  for (const i of range(0, 10, 2)) {
    stepValues.push(i);
  }
  expect(stepValues).toStrictEqual([0, 2, 4, 6, 8]);
}
