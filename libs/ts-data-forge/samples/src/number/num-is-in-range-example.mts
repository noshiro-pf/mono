// Example: src/number/num.mts (Num.isInRange)
import { Num } from 'ts-data-forge';

// embed-sample-code-ignore-above
const isGrade = Num.isInRange(0, 100);

assert.ok(isGrade(50));

assert.notOk(isGrade(100));
