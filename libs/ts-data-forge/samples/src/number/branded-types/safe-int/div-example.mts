// Example: src/number/branded-types/safe-int.mts (SafeInt.div)
import { SafeInt, asSafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const quotient = SafeInt.div(asSafeInt(-17), asSafeInt(5));

assert(quotient === -4);

assert.ok(SafeInt.is(quotient));
