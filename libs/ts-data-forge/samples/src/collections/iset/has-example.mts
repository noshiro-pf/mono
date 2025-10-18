// Example: src/collections/iset.mts (has)
import { ISet } from 'ts-data-forge';

// embed-sample-code-ignore-above
const set = ISet.create(['apple', 'banana']);

assert.ok(set.has('apple'));
assert.notOk(set.has('cherry'));
