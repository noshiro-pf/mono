// Example: src/array/array-utils.mts (eq)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const numbers = [1, 2, 3] as const;

const sameNumbers = [1, 2, 3] as const;

const differentNumbers = [1, 2, 4] as const;

assert.isTrue(Arr.eq(numbers, sameNumbers));

assert.isFalse(Arr.eq(numbers, differentNumbers));
