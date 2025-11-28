// Example: src/number/num.mts (Num.isInRangeInclusive)
import { Num } from 'ts-data-forge';

// embed-sample-code-ignore-above
const isPercentage = Num.isInRangeInclusive(0, 100);

assert.isTrue(isPercentage(100));

assert.isFalse(isPercentage(-1));
