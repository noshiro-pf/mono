// Example: src/number/branded-types/positive-safe-int.mts (PositiveSafeInt.clamp)
import { PositiveSafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const belowRange = PositiveSafeInt.clamp(0);

const withinRange = PositiveSafeInt.clamp(123);

const aboveRange = PositiveSafeInt.clamp(Number.MAX_SAFE_INTEGER + 10);

assert(belowRange === 1);

assert(withinRange === 123);

assert(aboveRange === Number.MAX_SAFE_INTEGER);
