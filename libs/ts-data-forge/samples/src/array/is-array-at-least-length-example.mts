// Example: src/array/array-utils.mts (isArrayAtLeastLength)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const queue: readonly string[] = ['task-1', 'task-2'];

const emptyQueue: readonly string[] = [];

assert.isTrue(Arr.isArrayAtLeastLength(queue, 1));

assert.isFalse(Arr.isArrayAtLeastLength(emptyQueue, 1));

if (Arr.isArrayAtLeastLength(queue, 1)) {
  assert.isTrue(queue[0] === 'task-1');
}
