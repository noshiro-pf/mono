// Example: src/guard/is-type.mts (isNotString)
import { isNotString } from 'ts-data-forge';

// embed-sample-code-ignore-above
const values: unknown[] = ['Ada', 42, 'Lovelace'];

const nonStrings = values.filter(isNotString);

assert.deepStrictEqual(nonStrings, [42]);
