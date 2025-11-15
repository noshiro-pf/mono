// Example: src/number/branded-types/safe-int.mts (asSafeInt)
import { SafeInt, asSafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const branded = asSafeInt(123);

assert(branded === 123);

assert.ok(SafeInt.is(branded));
