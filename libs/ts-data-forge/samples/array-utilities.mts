import { Arr, expectType, Optional } from 'ts-data-forge';

const numbers: readonly number[] = [1, 2, 3, 4, 5, 2, 3];

// Reduction
const sum = Arr.sum(numbers);

assert(sum === 20);

// Type-safe length checking
if (Arr.isArrayAtLeastLength(numbers, 2)) {
  // numbers is now guaranteed to have at least 2 elements
  expectType<typeof numbers, readonly [number, number, ...number[]]>('=');
  assert(numbers[1] === 2); // Safe access to index 1
}

// Take first n elements
const firstThree = Arr.take(numbers, 3);

assert.deepStrictEqual(firstThree, [1, 2, 3]);

// Remove duplicates
const unique = Arr.uniq(numbers);

assert.deepStrictEqual(unique, [1, 2, 3, 4, 5]);

// Array creation
const zeros: readonly [0, 0, 0, 0, 0] = Arr.zeros(5);
assert.deepStrictEqual(zeros, [0, 0, 0, 0, 0]);

const range: readonly [1, 2, 3] = Arr.range(1, 4);
assert.deepStrictEqual(range, [1, 2, 3]);

const people = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Charlie', age: 35 },
] as const;

// Find maximum by property
const oldestPerson = Arr.maxBy(people, (person) => person.age);
assert.deepStrictEqual(
  oldestPerson,
  Optional.some({ name: 'Charlie', age: 35 } as const),
);
if (Optional.isSome(oldestPerson)) {
  assert(oldestPerson.value.name === 'Charlie');
}
