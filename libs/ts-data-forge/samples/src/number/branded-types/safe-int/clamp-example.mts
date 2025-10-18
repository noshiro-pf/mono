// Example: src/number/branded-types/safe-int.mts (SafeInt.clamp)
import { SafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const aboveRange = SafeInt.clamp(1e20);
const withinRange = SafeInt.clamp(123);
const belowRange = SafeInt.clamp(-1e20);

assert(aboveRange === Number.MAX_SAFE_INTEGER);
assert(withinRange === 123);
assert(belowRange === Number.MIN_SAFE_INTEGER);
