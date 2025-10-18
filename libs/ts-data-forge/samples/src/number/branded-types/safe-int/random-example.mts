// Example: src/number/branded-types/safe-int.mts (SafeInt.random)
import { SafeInt, asSafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const min = asSafeInt(-10);
const max = asSafeInt(10);
const randomValue = SafeInt.random(min, max);

assert.ok(SafeInt.is(randomValue));
assert.ok(randomValue >= -10 && randomValue <= 10);
