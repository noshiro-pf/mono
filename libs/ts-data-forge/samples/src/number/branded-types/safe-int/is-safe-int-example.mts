// Example: src/number/branded-types/safe-int.mts (isSafeInt)
import { SafeInt, isSafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
assert.ok(isSafeInt(Number.MAX_SAFE_INTEGER));

assert.notOk(isSafeInt(Number.MAX_SAFE_INTEGER + 0.5));

assert.ok(SafeInt.is(Number.MIN_SAFE_INTEGER));
