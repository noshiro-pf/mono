// Example: src/number/branded-types/int.mts (Int.mul)
import { Int, asInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const product = Int.mul(asInt(-4), asInt(6));

assert.isTrue(product === -24);
