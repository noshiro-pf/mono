// Example: src/number/branded-types/uint.mts (isUint)
import { Uint, isUint } from 'ts-data-forge';

// embed-sample-code-ignore-above
assert.ok(isUint(4));
assert.notOk(isUint(-1));
assert.ok(Uint.is(0));
