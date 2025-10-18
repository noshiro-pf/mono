// Example: src/number/branded-types/positive-safe-int.mts (PositiveSafeInt.random)
import { PositiveSafeInt, asPositiveSafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const min = asPositiveSafeInt(1);
const max = asPositiveSafeInt(6);
const randomValue = PositiveSafeInt.random(min, max);

assert.ok(PositiveSafeInt.is(randomValue));
assert.ok(randomValue >= 1 && randomValue <= 6);
