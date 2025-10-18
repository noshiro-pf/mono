// Example: src/collections/iset.mts (subtract)
import { ISet } from 'ts-data-forge';

// embed-sample-code-ignore-above
const all = ISet.create<number>([1, 2, 3, 4]);
const toRemove = ISet.create<number>([2, 4]);

const difference = all.subtract(toRemove);

assert.deepStrictEqual(Array.from(difference), [1, 3]);
