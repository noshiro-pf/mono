// Example: src/array/array-utils.mts (create)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const threeOnes = Arr.create(3, 1);

const emptyStrings = Arr.create(0, 'Ada');

assert.deepStrictEqual(threeOnes, [1, 1, 1]);

assert.deepStrictEqual(emptyStrings, []);
