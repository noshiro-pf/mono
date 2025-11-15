// Example: src/array/array-utils.mts (indexIsInRange)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const items = ['Ada', 'Grace', 'Katherine'] as const;

assert.ok(Arr.indexIsInRange(items, 1));

assert.notOk(Arr.indexIsInRange(items, 3));

if (Arr.indexIsInRange(items, 2)) {
  assert(items[2] === 'Katherine');
}
