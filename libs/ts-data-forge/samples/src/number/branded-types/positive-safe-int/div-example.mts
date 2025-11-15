// Example: src/number/branded-types/positive-safe-int.mts (PositiveSafeInt.div)
import { PositiveSafeInt, asPositiveSafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const quotient = PositiveSafeInt.div(
  asPositiveSafeInt(25),
  asPositiveSafeInt(4),
);

const clamped = PositiveSafeInt.div(
  asPositiveSafeInt(5),
  asPositiveSafeInt(50),
);

assert(quotient === 6);

assert(clamped === 1);
