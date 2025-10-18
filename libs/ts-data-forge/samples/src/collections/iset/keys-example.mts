// Example: src/collections/iset.mts (keys)
import { ISet } from 'ts-data-forge';

// embed-sample-code-ignore-above
const set = ISet.create([1, 2]);

const keys = Array.from(set.keys());

assert.deepStrictEqual(keys, [1, 2]);
