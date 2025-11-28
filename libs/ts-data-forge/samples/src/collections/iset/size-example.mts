// Example: src/collections/iset.mts (size)
import { ISet } from 'ts-data-forge';

// embed-sample-code-ignore-above
const set = ISet.create([1, 2, 3]);

assert.isTrue(set.size === 3);
