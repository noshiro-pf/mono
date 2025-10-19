// Example: src/array/array-utils.mts (butLast)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const queue = ['task-1', 'task-2', 'task-3'] as const;
const withoutLast = Arr.butLast(queue);

assert.deepStrictEqual(withoutLast, ['task-1', 'task-2']);
assert(withoutLast.length === 2);
