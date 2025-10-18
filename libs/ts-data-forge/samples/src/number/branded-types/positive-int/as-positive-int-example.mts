// Example: src/number/branded-types/positive-int.mts (asPositiveInt)
import { PositiveInt, asPositiveInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const branded = asPositiveInt(7);

assert(branded === 7);
assert.ok(PositiveInt.is(branded));
