// Example: src/number/branded-types/positive-int.mts (isPositiveInt)
import { PositiveInt, isPositiveInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
assert.ok(isPositiveInt(5));
assert.notOk(isPositiveInt(0));
assert.ok(PositiveInt.is(10));
