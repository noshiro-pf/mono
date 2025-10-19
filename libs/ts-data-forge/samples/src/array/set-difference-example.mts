// Example: src/array/array-utils.mts (setDifference)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const baseline = [1, 2, 3, 4] as const;
const removed = [2, 4] as const;

const remaining = Arr.setDifference(baseline, removed);

assert.deepStrictEqual(remaining, [1, 3]);
