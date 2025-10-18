// Example: src/collections/iset.mts (isEmpty)
import { ISet } from 'ts-data-forge';

// embed-sample-code-ignore-above
const emptySet = ISet.create<number>([]);
const filledSet = ISet.create([1, 2]);

assert.ok(emptySet.isEmpty);
assert.notOk(filledSet.isEmpty);
