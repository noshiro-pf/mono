// Example: src/array/array-utils.mts (isSuperset)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const potentialSuperset = ['a', 'b', 'c'] as const;

const subset = ['a', 'c'] as const;

const notSuperset = ['a', 'd'] as const;

assert.isTrue(Arr.isSuperset(potentialSuperset, subset));

assert.isFalse(Arr.isSuperset(subset, potentialSuperset));

assert.isFalse(Arr.isSuperset(potentialSuperset, notSuperset));
