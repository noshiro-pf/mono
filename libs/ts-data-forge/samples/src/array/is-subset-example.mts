// Example: src/array/array-utils.mts (isSubset)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const subset = [1, 2] as const;

const superset = [1, 2, 3] as const;

const notSubset = [2, 4] as const;

assert.isTrue(Arr.isSubset(subset, superset));

assert.isFalse(Arr.isSubset(notSubset, superset));
