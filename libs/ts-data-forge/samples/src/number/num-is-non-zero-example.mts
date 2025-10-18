// Example: src/number/num.mts (Num.isNonZero)
import { Num } from 'ts-data-forge';

// embed-sample-code-ignore-above
const value: number = 5;

if (Num.isNonZero(value)) {
  // Safe to divide now that we know value is non-zero
  // eslint-disable-next-line total-functions/no-partial-division
  const inverted = 1 / value;
  assert(inverted === 0.2);
}

assert.notOk(Num.isNonZero(0));
