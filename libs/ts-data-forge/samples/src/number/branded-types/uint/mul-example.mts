// Example: src/number/branded-types/uint.mts (Uint.mul)
import { Uint, asUint } from 'ts-data-forge';

// embed-sample-code-ignore-above
const product = Uint.mul(asUint(7), asUint(6));

assert(product === 42);
