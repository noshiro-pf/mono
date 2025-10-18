// Example: src/number/branded-types/safe-int.mts (SafeInt.max)
import { SafeInt, asSafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const largest = SafeInt.max(asSafeInt(25), asSafeInt(-14), asSafeInt(99));

assert(largest === 99);
