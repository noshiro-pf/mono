// Example: src/array/array-utils.mts (indexIsInRange)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const items = ['Ada', 'Grace', 'Katherine'] as const;

assert.isTrue(Arr.indexIsInRange(items, 1));

assert.isFalse(Arr.indexIsInRange(items, 3));

if (Arr.indexIsInRange(items, 2)) {
  assert.isTrue(items[2] === 'Katherine');
}
