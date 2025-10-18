// Example: src/number/branded-types/positive-int.mts (PositiveInt.max)
import { PositiveInt, asPositiveInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const largest = PositiveInt.max(
  asPositiveInt(9),
  asPositiveInt(3),
  asPositiveInt(12),
);

assert(largest === 12);
