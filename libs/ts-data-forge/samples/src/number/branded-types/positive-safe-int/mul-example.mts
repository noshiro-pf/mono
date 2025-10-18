// Example: src/number/branded-types/positive-safe-int.mts (PositiveSafeInt.mul)
import { PositiveSafeInt, asPositiveSafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const product = PositiveSafeInt.mul(
  asPositiveSafeInt(50),
  asPositiveSafeInt(20),
);

assert(product === 1000);
assert.ok(PositiveSafeInt.is(product));
