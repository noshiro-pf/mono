// Example: src/number/branded-types/positive-int.mts (PositiveInt.sub)
import { PositiveInt, asPositiveInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const difference = PositiveInt.sub(asPositiveInt(5), asPositiveInt(7));

assert(difference === 1);
