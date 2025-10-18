// Example: src/guard/is-type.mts (isBigint)
import { isBigint } from 'ts-data-forge';

// embed-sample-code-ignore-above
const values: unknown[] = [1n, 2, 3n];

const bigints = values.filter(isBigint);

assert.deepStrictEqual(bigints, [1n, 3n]);
