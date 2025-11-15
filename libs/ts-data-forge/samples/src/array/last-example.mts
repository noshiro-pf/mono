// Example: src/array/array-utils.mts (last)
import { Arr, Optional } from 'ts-data-forge';

// embed-sample-code-ignore-above
const queue = ['first', 'second'];

const emptyQueue: string[] = [];

const lastValue = Arr.last(queue);

const none = Arr.last(emptyQueue);

assert.deepStrictEqual(lastValue, Optional.some('second'));

assert.deepStrictEqual(none, Optional.none);
