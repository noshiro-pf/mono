// Example: src/number/branded-types/safe-int.mts (SafeInt.abs)
import { SafeInt, asSafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const negative = asSafeInt(-900);

const absolute = SafeInt.abs(negative);

assert(absolute === 900);

assert.ok(SafeInt.is(absolute));
