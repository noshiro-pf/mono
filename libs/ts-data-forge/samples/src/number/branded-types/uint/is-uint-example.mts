// Example: src/number/branded-types/uint.mts (isUint)
import { Uint, isUint } from 'ts-data-forge';

// embed-sample-code-ignore-above
assert.isTrue(isUint(4));

assert.isFalse(isUint(-1));

assert.isTrue(Uint.is(0));
