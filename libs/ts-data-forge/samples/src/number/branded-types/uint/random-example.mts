// Example: src/number/branded-types/uint.mts (Uint.random)
import { Uint, asUint } from 'ts-data-forge';

// embed-sample-code-ignore-above
const min = asUint(0);
const max = asUint(3);
const randomValue = Uint.random(min, max);

assert.ok(Uint.is(randomValue));
assert.ok(randomValue >= 0 && randomValue <= 3);
