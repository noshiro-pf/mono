// Example: src/array/array-utils.mts (minBy)
import { Arr, Optional } from 'ts-data-forge';

// embed-sample-code-ignore-above
const users = [
  { id: 1, visits: 10 },
  { id: 2, visits: 3 },
  { id: 3, visits: 5 },
] as const;

const leastVisits = Arr.minBy(users, (user) => user.visits);
const custom = Arr.minBy(
  users,
  (user) => user.visits,
  (a, b) => b - a,
);

assert.deepStrictEqual(leastVisits, Optional.some({ id: 2, visits: 3 }));
assert.deepStrictEqual(custom, Optional.some({ id: 1, visits: 10 }));
