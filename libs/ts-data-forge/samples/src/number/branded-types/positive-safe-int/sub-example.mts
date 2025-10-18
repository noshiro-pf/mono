// Example: src/number/branded-types/positive-safe-int.mts (PositiveSafeInt.sub)
import { PositiveSafeInt, asPositiveSafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const difference = PositiveSafeInt.sub(
  asPositiveSafeInt(10),
  asPositiveSafeInt(20),
);

assert(difference === 1);
assert.ok(PositiveSafeInt.is(difference));
