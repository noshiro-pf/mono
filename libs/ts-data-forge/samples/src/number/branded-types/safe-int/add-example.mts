// Example: src/number/branded-types/safe-int.mts (SafeInt.add)
import { SafeInt, asSafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const sum = SafeInt.add(asSafeInt(9), asSafeInt(4));

assert(sum === 13);

assert.ok(SafeInt.is(sum));
