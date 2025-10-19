// Example: src/array/array-utils.mts (toUnshifted)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const base = [2, 3] as const;

const prefixed = Arr.toUnshifted(base, 1);
const prefixedCurried = Arr.toUnshifted(0)(base);

assert.deepStrictEqual(prefixed, [1, 2, 3]);
assert.deepStrictEqual(prefixedCurried, [0, 2, 3]);
