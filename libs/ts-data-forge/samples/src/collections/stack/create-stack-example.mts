// Example: src/collections/stack.mts (createStack)
import { Optional, createStack } from 'ts-data-forge';

// embed-sample-code-ignore-above
const stack = createStack<string>();

assert.ok(stack.isEmpty);
assert(stack.size === 0);

stack.push('first');
// eslint-disable-next-line unicorn/prefer-single-call
stack.push('second');

assert.notOk(stack.isEmpty);
assert(stack.size === 2);
assert.deepStrictEqual(stack.pop(), Optional.some('second'));
assert.deepStrictEqual(stack.pop(), Optional.some('first'));
assert.deepStrictEqual(stack.pop(), Optional.none);

const seededStack = createStack([10, 20, 30]);

assert(seededStack.size === 3);
assert.deepStrictEqual(seededStack.pop(), Optional.some(30));
