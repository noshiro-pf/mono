// Example: src/number/branded-types/safe-int.mts (SafeInt.clamp)
import { SafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const aboveRange = SafeInt.clamp(1e20);

const withinRange = SafeInt.clamp(123);

const belowRange = SafeInt.clamp(-1e20);

assert.isTrue(aboveRange === Number.MAX_SAFE_INTEGER);

assert.isTrue(withinRange === 123);

assert.isTrue(belowRange === Number.MIN_SAFE_INTEGER);
