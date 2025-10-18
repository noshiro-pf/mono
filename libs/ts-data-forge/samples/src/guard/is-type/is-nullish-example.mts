// Example: src/guard/is-type.mts (isNullish)
import { isNullish } from 'ts-data-forge';

// embed-sample-code-ignore-above
const values: (string | null | undefined)[] = ['Ada', null, undefined];

const nullishValues = values.filter(isNullish);

assert.deepStrictEqual(nullishValues, [null, undefined]);
