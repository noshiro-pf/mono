// Example: src/number/num.mts (Num.isPositive)
import { Num } from 'ts-data-forge';

// embed-sample-code-ignore-above
const amount = 42;

if (Num.isPositive(amount)) {
  assert.ok(amount > 0);
}

assert.notOk(Num.isPositive(0));
