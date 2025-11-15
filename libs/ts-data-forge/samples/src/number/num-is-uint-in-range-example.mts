// Example: src/number/num.mts (Num.isUintInRange)
import { Num } from 'ts-data-forge';

// embed-sample-code-ignore-above
const indexGuard = Num.isUintInRange(0, 5);

assert.ok(indexGuard(3));

assert.notOk(indexGuard(5));

assert.notOk(indexGuard(-1));
