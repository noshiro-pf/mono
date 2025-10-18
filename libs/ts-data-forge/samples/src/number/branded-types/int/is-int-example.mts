// Example: src/number/branded-types/int.mts (isInt)
import { Int, isInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
assert.ok(isInt(5));
assert.notOk(isInt(5.25));
assert.ok(Int.is(-10));
