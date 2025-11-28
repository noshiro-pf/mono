// Example: src/number/branded-types/uint.mts (asUint)
import { Uint, asUint } from 'ts-data-forge';

// embed-sample-code-ignore-above
const branded = asUint(12);

assert.isTrue(branded === 12);

assert.isTrue(Uint.is(branded));
