// Example: src/number/num.mts (Num.isNonNegative)
import { Num } from 'ts-data-forge';

// embed-sample-code-ignore-above
const candidate = 10;

if (Num.isNonNegative(candidate)) {
  const index: number = candidate;

  assert(index === 10);
}

assert.notOk(Num.isNonNegative(-1));
