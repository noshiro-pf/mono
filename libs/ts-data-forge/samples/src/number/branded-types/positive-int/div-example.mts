// Example: src/number/branded-types/positive-int.mts (PositiveInt.div)
import { PositiveInt, asPositiveInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const quotient = PositiveInt.div(asPositiveInt(9), asPositiveInt(2));
const clamped = PositiveInt.div(asPositiveInt(3), asPositiveInt(10));

assert(quotient === 4);
assert(clamped === 1);
