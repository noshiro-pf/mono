// Example: src/collections/iset.mts (isSubsetOf)
import { ISet } from 'ts-data-forge';

// embed-sample-code-ignore-above
const subset = ISet.create<number>([1, 2]);
const superset = ISet.create<number>([1, 2, 3]);

assert.ok(subset.isSubsetOf(superset));
assert.notOk(superset.isSubsetOf(subset));
