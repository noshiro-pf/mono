// Example: src/collections/iset.mts (some)
import { ISet } from 'ts-data-forge';

// embed-sample-code-ignore-above
const numbers = ISet.create([1, 3, 5]);

assert.ok(numbers.some((value) => value > 4));

assert.notOk(numbers.some((value) => value > 10));
