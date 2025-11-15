// Example: src/number/branded-types/positive-safe-int.mts (isPositiveSafeInt)
import { PositiveSafeInt, isPositiveSafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
assert.ok(isPositiveSafeInt(1));

assert.ok(isPositiveSafeInt(Number.MAX_SAFE_INTEGER));

assert.notOk(isPositiveSafeInt(0));

assert.ok(PositiveSafeInt.is(42));
