// Example: src/guard/is-type.mts (isNotBoolean)
import { isNotBoolean } from 'ts-data-forge';

// embed-sample-code-ignore-above
const flags: unknown[] = [true, 'no', false];

const nonBooleans = flags.filter(isNotBoolean);

assert.deepStrictEqual(nonBooleans, ['no']);
