// Example: src/number/branded-types/uint.mts (Uint.add)
import { Uint, asUint } from 'ts-data-forge';

// embed-sample-code-ignore-above
const sum = Uint.add(asUint(5), asUint(8));

assert(sum === 13);
