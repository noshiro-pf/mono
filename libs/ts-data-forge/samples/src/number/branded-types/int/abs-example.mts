// Example: src/number/branded-types/int.mts (Int.abs)
import { Int, asInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const negative = asInt(-12);

const absolute = Int.abs(negative);

assert.isTrue(absolute === 12);

assert.isTrue(Int.is(absolute));
