// Example: src/array/array-utils.mts (seq)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const emptySeq = Arr.seq(0);

const firstFive = Arr.seq(5);

assert.deepStrictEqual(emptySeq, []);

assert.deepStrictEqual(firstFive, [0, 1, 2, 3, 4]);
