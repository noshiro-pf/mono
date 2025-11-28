// Example: src/number/num.mts (Num.isNonNegative)
import { Num } from 'ts-data-forge';

// embed-sample-code-ignore-above
const candidate = 10;

if (Num.isNonNegative(candidate)) {
  const index: number = candidate;

  assert.isTrue(index === 10);
}

assert.isFalse(Num.isNonNegative(-1));
