import * as assert from 'node:assert/strict';
import { createState, map } from 'synstate';

const [count, setCount] = createState(1);

// `pipe` composes operators into a derived observable.
const doubled = count.pipe(map((n) => n * 2));

const mut_seen = [];

doubled.subscribe((n) => {
  mut_seen.push(n);
});

setCount(2);
setCount(3);

// The subscriber sees the current value first, then each update.
assert.deepStrictEqual(mut_seen, [2, 4, 6]);

// The snapshot is an Optional from ts-data-forge, not a bare value.
assert.deepStrictEqual(doubled.getCurrentValue().value, 6);

console.info('synstate ok');
