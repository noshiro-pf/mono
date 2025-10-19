// Example: src/array/array-utils.mts (at)
import { Arr, Optional } from 'ts-data-forge';

// embed-sample-code-ignore-above
const letters: readonly string[] = ['a', 'b', 'c'];

const two = Arr.at(letters, 1);
const last = Arr.at(-1)(letters);
const missing = Arr.at(letters, 5);

assert.deepStrictEqual(two, Optional.some('b'));
assert.deepStrictEqual(last, Optional.some('c'));
assert.deepStrictEqual(missing, Optional.none);
