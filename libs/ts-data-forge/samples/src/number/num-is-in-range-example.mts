// Example: src/number/num.mts (Num.isInRange)
import { Num } from 'ts-data-forge';

// embed-sample-code-ignore-above
const isGrade = Num.isInRange(0, 100);

assert.isTrue(isGrade(50));

assert.isFalse(isGrade(100));
