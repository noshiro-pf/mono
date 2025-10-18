// Example: src/collections/iset.mts (map)
import { ISet } from 'ts-data-forge';

// embed-sample-code-ignore-above
const letters = ISet.create(['a', 'b']);

const upper = letters.map((value) => value.toUpperCase());

assert.deepStrictEqual(Array.from(upper), ['A', 'B']);
