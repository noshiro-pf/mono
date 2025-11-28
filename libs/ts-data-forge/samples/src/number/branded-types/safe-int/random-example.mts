// Example: src/number/branded-types/safe-int.mts (SafeInt.random)
import { SafeInt, asSafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const min = asSafeInt(-10);

const max = asSafeInt(10);

const randomValue = SafeInt.random(min, max);

assert.isTrue(SafeInt.is(randomValue));

assert.isTrue(randomValue >= -10 && randomValue <= 10);
