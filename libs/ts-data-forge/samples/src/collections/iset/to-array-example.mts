// Example: src/collections/iset.mts (toArray)
import { ISet } from 'ts-data-forge';

// embed-sample-code-ignore-above
const set = ISet.create(['north', 'south']);

assert.deepStrictEqual(set.toArray(), ['north', 'south']);
