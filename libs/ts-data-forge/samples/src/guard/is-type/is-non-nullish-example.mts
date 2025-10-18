// Example: src/guard/is-type.mts (isNonNullish)
import { isNonNullish } from 'ts-data-forge';

// embed-sample-code-ignore-above
const values: (string | null | undefined)[] = ['Ada', null, undefined];

const definedValues = values.filter(isNonNullish);

assert.deepStrictEqual(definedValues, ['Ada']);
