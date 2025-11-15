// Example: src/number/branded-types/positive-int.mts (PositiveInt.clamp)
import { PositiveInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const belowRange = PositiveInt.clamp(0);

const withinRange = PositiveInt.clamp(10);

assert(belowRange === 1);

assert(withinRange === 10);
