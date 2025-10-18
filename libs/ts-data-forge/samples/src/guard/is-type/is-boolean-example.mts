// Example: src/guard/is-type.mts (isBoolean)
import { isBoolean } from 'ts-data-forge';

// embed-sample-code-ignore-above
const flags: unknown[] = [true, 'no', false];

const booleans = flags.filter(isBoolean);

assert.deepStrictEqual(booleans, [true, false]);
