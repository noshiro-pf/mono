// Example: src/number/branded-types/safe-int.mts (SafeInt.pow)
import { SafeInt, asSafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const base = asSafeInt(3);
const exponent = asSafeInt(5);
const power = SafeInt.pow(base, exponent);

assert(power === 243);
assert.ok(SafeInt.is(power));
