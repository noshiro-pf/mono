// Example: src/collections/iset.mts (ISet.equal)
import { ISet } from 'ts-data-forge';

// embed-sample-code-ignore-above
const first = ISet.create<number>([1, 2]);
const second = ISet.create<number>([2, 1]);
const third = ISet.create<number>([1, 3]);

assert.ok(ISet.equal(first, second));
assert.notOk(ISet.equal(first, third));
