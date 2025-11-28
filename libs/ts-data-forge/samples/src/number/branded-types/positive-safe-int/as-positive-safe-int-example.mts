// Example: src/number/branded-types/positive-safe-int.mts (asPositiveSafeInt)
import { PositiveSafeInt, asPositiveSafeInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const branded = asPositiveSafeInt(128);

assert.isTrue(branded === 128);

assert.isTrue(PositiveSafeInt.is(branded));
