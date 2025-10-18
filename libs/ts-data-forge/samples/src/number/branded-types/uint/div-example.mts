// Example: src/number/branded-types/uint.mts (Uint.div)
import { Uint, asUint } from 'ts-data-forge';

// embed-sample-code-ignore-above
const quotient = Uint.div(asUint(10), asUint(4));

assert(quotient === 2);
