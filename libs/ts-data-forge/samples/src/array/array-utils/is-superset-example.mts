// Example: src/array/array-utils.mts (isSuperset)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const potentialSuperset = ['a', 'b', 'c'] as const;
const subset = ['a', 'c'] as const;
const notSuperset = ['a', 'd'] as const;

assert.ok(Arr.isSuperset(potentialSuperset, subset));
assert.notOk(Arr.isSuperset(subset, potentialSuperset));
assert.notOk(Arr.isSuperset(potentialSuperset, notSuperset));
