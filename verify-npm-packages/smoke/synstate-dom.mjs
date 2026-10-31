// cspell:ignore jsxs

import * as assert from 'node:assert/strict';
import { createState } from 'synstate';
import {
  constant,
  derive,
  For,
  If,
  isImeKeyDown,
  mapBindable,
  render,
  toObservable,
} from 'synstate-dom';
import { jsxDEV } from 'synstate-dom/jsx-dev-runtime';
import { Fragment, jsx, jsxs } from 'synstate-dom/jsx-runtime';

// Node has no DOM, so this checks what runs without one: the package and its
// two JSX subpaths resolve, and the `Bindable` helpers work on the synstate
// the consumer installed. Mounting is covered by the browser tests in the
// repository.

const [count, setCount] = createState(1);

// A constant is the value itself at run time, and stays one through
// `mapBindable` and `derive`, so it never becomes a graph node.
const label = constant('count');

assert.equal(label, 'count');

assert.equal(
  mapBindable(label, (s) => s.toUpperCase()),
  'COUNT',
);

// An observable passed in comes back as a derived observable.
const text = derive([label, count], (l, n) => `${l}: ${n}`);

const mut_seen = [];

text.subscribe((s) => {
  mut_seen.push(s);
});

setCount(2);

assert.deepStrictEqual(mut_seen, ['count: 1', 'count: 2']);

assert.equal(toObservable(label).getSnapshot().value, 'count');

// `jsx` only describes an element; nothing touches `document` until it is
// mounted, which is what lets this run under Node.
const element = jsxs('p', { children: [label, text] });

assert.equal(typeof element.mount, 'function');

assert.equal(typeof jsx('div', {}).mount, 'function');

assert.equal(typeof jsxDEV('div', {}).mount, 'function');

assert.equal(typeof Fragment({}).mount, 'function');

for (const component of [For, If, render]) {
  assert.equal(typeof component, 'function');
}

// `isImeKeyDown` reads only the event's fields, so a plain object stands in
// for a `KeyboardEvent`: Safari's Enter after `compositionend` is the input
// method's, and an Android keyboard's arrow key with the same key code is not.
assert.equal(
  isImeKeyDown({ key: 'Enter', keyCode: 229, isComposing: false }),
  true,
);

assert.equal(
  isImeKeyDown({ key: 'ArrowUp', keyCode: 229, isComposing: false }),
  false,
);

console.info('synstate-dom ok');
