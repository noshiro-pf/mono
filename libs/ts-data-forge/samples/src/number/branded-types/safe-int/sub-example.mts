// Example: src/number/branded-types/safe-int.mts (SafeInt.sub)
import { SafeInt, asSafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const difference = SafeInt.sub(asSafeInt(9), asSafeInt(14));

assert(difference === -5);

assert.ok(SafeInt.is(difference));
