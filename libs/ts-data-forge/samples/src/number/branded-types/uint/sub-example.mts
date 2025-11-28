// Example: src/number/branded-types/uint.mts (Uint.sub)
import { Uint, asUint } from 'ts-data-forge';

// embed-sample-code-ignore-above
const difference = Uint.sub(asUint(5), asUint(8));

assert.isTrue(difference === 0);
