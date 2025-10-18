// Example: src/collections/iset.mts (entries)
import { ISet } from 'ts-data-forge';

// embed-sample-code-ignore-above
const set = ISet.create(['red', 'blue']);

const entries = Array.from(set.entries());

assert.deepStrictEqual(entries, [
  ['red', 'red'],
  ['blue', 'blue'],
]);
