// Example: src/number/branded-types/safe-int.mts (SafeInt.min)
import { SafeInt, asSafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const smallest = SafeInt.min(asSafeInt(25), asSafeInt(-14), asSafeInt(99));

assert.isTrue(smallest === -14);
