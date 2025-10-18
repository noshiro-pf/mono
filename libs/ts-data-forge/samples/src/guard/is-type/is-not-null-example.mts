// Example: src/guard/is-type.mts (isNotNull)
import { isNotNull } from 'ts-data-forge';

// embed-sample-code-ignore-above
const values: (number | null)[] = [null, 5];

const nonNullValues = values.filter(isNotNull);

assert.deepStrictEqual(nonNullValues, [5]);
