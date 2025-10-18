// Example: src/array/array-utils.mts (some)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const numbers = [1, 3, 5] as const;
const words = ['Ada', 'Grace'] as const;

const hasEven = Arr.some(numbers, (value) => value % 2 === 0);
const hasShortName = Arr.some(words, (value) => value.length <= 3);

assert.notOk(hasEven);
assert.ok(hasShortName);
