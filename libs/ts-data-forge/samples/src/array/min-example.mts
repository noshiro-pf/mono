// Example: src/array/array-utils.mts (min)
import { Arr, Optional } from 'ts-data-forge';

// embed-sample-code-ignore-above
const values = [5, 3, 9] as const;
const empty: readonly number[] = [];

const smallest = Arr.min(values);
const none = Arr.min(empty);
const custom = Arr.min(values, (a, b) => b - a);

assert.deepStrictEqual(smallest, Optional.some(3));
assert.deepStrictEqual(none, Optional.none);
assert.deepStrictEqual(custom, Optional.some(9));
