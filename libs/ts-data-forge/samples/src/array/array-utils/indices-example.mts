// Example: src/array/array-utils.mts (indices)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const items = ['zero', 'one', 'two'] as const;

const indexList = Array.from(Arr.indices(items));

assert.deepStrictEqual(indexList, [0, 1, 2]);
