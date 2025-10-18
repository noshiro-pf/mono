// Example: src/collections/iset.mts (ISet.create)
import { ISet } from 'ts-data-forge';

// embed-sample-code-ignore-above
const set = ISet.create(['a', 'a', 'b']);

assert.deepStrictEqual(Array.from(set), ['a', 'b']);
