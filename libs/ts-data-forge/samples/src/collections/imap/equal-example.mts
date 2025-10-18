// Example: src/collections/imap.mts (equal)
import { IMap } from 'ts-data-forge';

// embed-sample-code-ignore-above
const first = IMap.create<'a' | 'b', number>([
  ['a', 1],
  ['b', 2],
]);

const second = IMap.create<'a' | 'b', number>([
  ['b', 2],
  ['a', 1],
]);

const third = IMap.create<'a' | 'b', number>([
  ['a', 1],
  ['b', 3],
]);

assert.ok(IMap.equal(first, second));
assert.notOk(IMap.equal(first, third));
