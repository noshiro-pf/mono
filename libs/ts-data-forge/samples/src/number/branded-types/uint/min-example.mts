// Example: src/number/branded-types/uint.mts (Uint.min)
import { Uint, asUint } from 'ts-data-forge';

// embed-sample-code-ignore-above
const smallest = Uint.min(asUint(7), asUint(3));

assert(smallest === 3);
