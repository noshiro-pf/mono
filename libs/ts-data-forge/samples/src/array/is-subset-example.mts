// Example: src/array/array-utils.mts (isSubset)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const subset = [1, 2] as const;
const superset = [1, 2, 3] as const;
const notSubset = [2, 4] as const;

assert.ok(Arr.isSubset(subset, superset));
assert.notOk(Arr.isSubset(notSubset, superset));
