// Example: src/number/branded-types/positive-safe-int.mts (isPositiveSafeInt)
import { PositiveSafeInt, isPositiveSafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
assert.isTrue(isPositiveSafeInt(1));

assert.isTrue(isPositiveSafeInt(Number.MAX_SAFE_INTEGER));

assert.isFalse(isPositiveSafeInt(0));

assert.isTrue(PositiveSafeInt.is(42));
