// Example: src/number/num.mts (Num.isInRangeInclusive)
import { Num } from 'ts-data-forge';

// embed-sample-code-ignore-above
const isPercentage = Num.isInRangeInclusive(0, 100);

assert.ok(isPercentage(100));

assert.notOk(isPercentage(-1));
