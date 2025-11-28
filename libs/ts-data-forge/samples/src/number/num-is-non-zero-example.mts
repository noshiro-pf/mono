// Example: src/number/num.mts (Num.isNonZero)
import { Num } from 'ts-data-forge';

// embed-sample-code-ignore-above
const value: number = 5;

if (Num.isNonZero(value)) {
  // Safe to divide now that we know value is non-zero
  // eslint-disable-next-line total-functions/no-partial-division
  const inverted = 1 / value;

  assert.isTrue(inverted === 0.2);
}

assert.isFalse(Num.isNonZero(0));
