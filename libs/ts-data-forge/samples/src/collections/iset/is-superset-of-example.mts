// Example: src/collections/iset.mts (isSupersetOf)
import { ISet } from 'ts-data-forge';

// embed-sample-code-ignore-above
const superset = ISet.create<string>(['a', 'b', 'c']);

const subset = ISet.create<string>(['a', 'c']);

assert.isTrue(superset.isSupersetOf(subset));

assert.isFalse(subset.isSupersetOf(superset));
