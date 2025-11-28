// Example: src/collections/iset.mts (has)
import { ISet } from 'ts-data-forge';

// embed-sample-code-ignore-above
const set = ISet.create(['apple', 'banana']);

assert.isTrue(set.has('apple'));

assert.isFalse(set.has('cherry'));
