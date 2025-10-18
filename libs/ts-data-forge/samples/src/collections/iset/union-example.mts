// Example: src/collections/iset.mts (union)
import { ISet } from 'ts-data-forge';

// embed-sample-code-ignore-above
const numbers = ISet.create([1, 2]);
const letters = ISet.create(['a', 'b']);

const combined = numbers.union(letters);

assert.deepStrictEqual(Array.from(combined), [1, 2, 'a', 'b']);
