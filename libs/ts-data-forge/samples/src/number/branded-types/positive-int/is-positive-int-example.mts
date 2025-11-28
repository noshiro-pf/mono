// Example: src/number/branded-types/positive-int.mts (isPositiveInt)
import { PositiveInt, isPositiveInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
assert.isTrue(isPositiveInt(5));

assert.isFalse(isPositiveInt(0));

assert.isTrue(PositiveInt.is(10));
