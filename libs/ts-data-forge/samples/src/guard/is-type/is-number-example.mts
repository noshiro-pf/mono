// Example: src/guard/is-type.mts (isNumber)
import { isNumber } from 'ts-data-forge';

// embed-sample-code-ignore-above
const mixed: unknown[] = [1, '2', 3];

const numbers = mixed.filter(isNumber);

assert.deepStrictEqual(numbers, [1, 3]);
