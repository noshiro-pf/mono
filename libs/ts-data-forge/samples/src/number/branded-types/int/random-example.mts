// Example: src/number/branded-types/int.mts (Int.random)
import { Int, asInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const min = asInt(1);
const max = asInt(6);
const randomValue = Int.random(min, max);

assert.ok(Int.is(randomValue));
assert.ok(randomValue >= 1 && randomValue <= 6);
