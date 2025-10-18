// Example: src/number/branded-types/uint.mts (Uint.clamp)
import { Uint } from 'ts-data-forge';

// embed-sample-code-ignore-above
const clampedNegative = Uint.clamp(-5);
const clampedPositive = Uint.clamp(42);

assert(clampedNegative === 0);
assert(clampedPositive === 42);
