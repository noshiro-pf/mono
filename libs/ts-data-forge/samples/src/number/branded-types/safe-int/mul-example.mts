// Example: src/number/branded-types/safe-int.mts (SafeInt.mul)
import { SafeInt, asSafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const product = SafeInt.mul(asSafeInt(-8), asSafeInt(7));

assert(product === -56);
assert.ok(SafeInt.is(product));
