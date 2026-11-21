import * as assert from 'node:assert/strict';
import {
  createDerived,
  createRootOwner,
  createSource,
  createState,
  derive,
  map,
} from 'synstate';

const [count, setCount] = createState(1);

// `pipe` composes operators into a derived observable.
const doubled = count.pipe(map((n) => n * 2));

// A diamond: `sum` reads `count` directly and through `doubled`.
const sum = derive([count, doubled], (c, d) => c + d);

const mut_seen = [];

const unsubscribe = sum.subscribe((n) => {
  mut_seen.push(n);
});

setCount(2);
setCount(3);

// The subscriber sees the current value first, then one value per update,
// never one computed from a mix of old and new inputs.
assert.deepStrictEqual(mut_seen, [3, 6, 9]);

unsubscribe();

setCount(4);

assert.deepStrictEqual(mut_seen, [3, 6, 9]);

// The authoring API: a source and an operator built only from what the
// package exports, and an owner that disposes what was made in it.
const mut_listeners = new Set();

const fromEmitter = () =>
  createSource((ctx) => {
    const listener = (value) => {
      ctx.emit(value);
    };

    mut_listeners.add(listener);

    ctx.onCleanup(() => {
      mut_listeners.delete(listener);
    });
  });

const emit = (value) => {
  for (const listener of mut_listeners) {
    listener(value);
  }
};

const double = (parent) =>
  createDerived([parent], (ctx) => () => {
    if (ctx.emitted(parent)) {
      ctx.set(parent.value * 2);
    }
  });

const owner = createRootOwner();

const mut_authored = [];

owner.run(() => {
  double(fromEmitter()).subscribe((n) => {
    mut_authored.push(n);
  });
});

emit(1);

emit(2);

assert.deepStrictEqual(mut_authored, [2, 4]);

owner.dispose();

// Disposing the owner removed the listener.
assert.strictEqual(mut_listeners.size, 0);

emit(3);

assert.deepStrictEqual(mut_authored, [2, 4]);

console.info('synstate ok');
