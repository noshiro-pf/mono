// Example: src/number/branded-types/int.mts (Int.sub)
import { Int, asInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const difference = Int.sub(asInt(12), asInt(8));

assert.isTrue(difference === 4);
