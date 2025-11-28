// Example: src/collections/iset.mts (every)
import { ISet } from 'ts-data-forge';

// embed-sample-code-ignore-above
const numbers = ISet.create([2, 4, 6]);

const allEven = numbers.every((value) => value % 2 === 0);

const narrowed = numbers.every((value): value is 2 | 4 | 6 => value % 2 === 0);

assert.isTrue(allEven);

assert.isTrue(narrowed);
