// Example: src/guard/is-type.mts (isNull)
import { isNull } from 'ts-data-forge';

// embed-sample-code-ignore-above
const values: readonly (number | null)[] = [null, 5] as const;

const nullValues = values.filter(isNull);

assert.deepStrictEqual(nullValues, [null]);
