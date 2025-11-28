// Example: src/number/branded-types/int.mts (isInt)
import { Int, isInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
assert.isTrue(isInt(5));

assert.isFalse(isInt(5.25));

assert.isTrue(Int.is(-10));
