// Example: src/number/branded-types/positive-safe-int.mts (PositiveSafeInt.add)
import { PositiveSafeInt, asPositiveSafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const sum = PositiveSafeInt.add(
  asPositiveSafeInt(1000),
  asPositiveSafeInt(2048),
);

assert.isTrue(sum === 3048);

assert.isTrue(PositiveSafeInt.is(sum));
