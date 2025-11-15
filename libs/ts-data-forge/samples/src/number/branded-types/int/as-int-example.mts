// Example: src/number/branded-types/int.mts (asInt)
import { Int, asInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const branded = asInt(42);

assert(branded === 42);

assert.ok(Int.is(branded));
