---
title: Deriving values
description: pipe and InitKind, derive and combine, merge and zip, the equality cut-off, and reading a value without following it.
---

## `pipe`

`observable.pipe(op1, op2, …)` applies up to four operators in order; chain `pipe` again for more. Each operator declares in its type what it does to the value held at the start:

| `InitKind` | Meaning                                  | Operators                                                                                                            |
| :--------- | :--------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| `keep`     | Holds a value when its source does       | `map`, `debounce`, `throttle`, `audit`, `take`, `takeUntil`, `skipIfNoChange`, `keepEqualParts`, `withBufferedFrom`  |
| `drop`     | May hold none, whatever its source holds | `filter`, `skip`, `takeWhile`, `skipWhile`, `skipUntil`, `pairwise`, `switchMap`, `mergeMap`, `withCurrentValueFrom` |
| `with`     | Always holds one                         | `scan`, `withInitialValue`                                                                                           |

`pipe` folds them into the type of the result: an `InitializedObservable<A>`, which has `.value`, or an `Observable<A>`, which has `hasValue` and `peek()`. See the [introduction](/mono/synstate-next/getting-started/introduction/#deriving-values-with-pipe) for an example.

## `derive` and `combine`

`derive(parents, fn)` computes one value from several observables, once per update however many of them changed, and passes it on unless it equals the one held. `combine(parents)` gives the latest values as a tuple, on every update that reaches it: a new tuple each time, so it is never cut off.

```tsx
import { batch, combine, createState, derive } from 'synstate-next';

const [price, setPrice] = createState(100);

const [quantity, setQuantity] = createState(2);

// Computed once per update, however many parents changed.
const total = derive([price, quantity], (p, q) => p * q);

assert.strictEqual(total.value, 200);

// The latest values as a tuple.
const pair = combine([price, quantity]);

const mut_totals: number[] = [];

const mut_pairs: string[] = [];

total.subscribe((t) => {
    mut_totals.push(t);
});

pair.subscribe(([p, q]) => {
    mut_pairs.push(`${p} × ${q}`);
});

batch(() => {
    setPrice(50);

    setQuantity(4);
});

// 50 × 4 is 200 again: `total` cuts the update off. `combine` builds a new
// tuple on every update, so it never does.
assert.deepStrictEqual(mut_totals, [200]);

assert.deepStrictEqual(mut_pairs, ['100 × 2', '50 × 4']);
```

Prefer `derive` for a value computed from several others: it computes once, and it cuts off. Use `combine` where you need the tuple itself, such as an input to `debounce`. Both hold a value once every parent holds one.

## `merge` and `zip`

`merge(parents)` emits whatever any parent emitted (the first of them, if several did in one update). `zip(parents)` pairs the n-th values of each parent, waiting for the slowest:

```tsx
import { createValueEmitter, merge, zip } from 'synstate-next';

const [mouse, emitMouse] = createValueEmitter<string>();

const [keyboard, emitKeyboard] = createValueEmitter<string>();

// Whichever emitted.
const input = merge([mouse, keyboard]);

// The n-th value of each, paired.
const pairs = zip([mouse, keyboard]);

const mut_inputs: string[] = [];

const mut_pairs: string[] = [];

input.subscribe((value) => {
    mut_inputs.push(value);
});

pairs.subscribe(([m, k]) => {
    mut_pairs.push(`${m} + ${k}`);
});

emitMouse('click');

emitMouse('drag');

emitKeyboard('a');

emitKeyboard('b');

assert.deepStrictEqual(mut_inputs, ['click', 'drag', 'a', 'b']);

assert.deepStrictEqual(mut_pairs, ['click + a', 'drag + b']);
```

## The equality cut-off

Every node that computes a value (`map`, `derive`, a state's write) compares it with the one it holds, by `Object.is` unless you pass `equals`, and passes nothing on when they are equal. Nothing below it is visited. `switchMap` compares, by `Object.is`, only when it switches: the value the new inner observable holds is cut off when it equals the one held, and what the inner observable emits later passes through. The operators that only pass values on (`filter`, `take`, …) pass what reached them, and those that pass events (`combine`, `merge`, `zip`, `scan`, `pairwise`, the time operators) never compare.

That is what you want for a value, and not for an event. Mapping every click to `1` gives `1` each time, and the second `1` would be taken for no change: pass `equals: () => false` to a `map` of an event whose result can repeat.

```tsx
import { createEventEmitter, createState, map, scan } from 'synstate-next';

const [count, setCount] = createState(1);

const isEven = count.pipe(map((n) => n % 2 === 0));

let mut_computed = 0;

const label = isEven.pipe(
    map((even) => {
        mut_computed += 1;

        return even ? 'even' : 'odd';
    }),
);

setCount(3);

setCount(5);

// `isEven` stayed `false`, so nothing below it was visited.
assert.strictEqual(mut_computed, 1);

assert.strictEqual(label.value, 'odd');

// An event mapped to a value that repeats: pass `equals: () => false`, or
// the second one is taken for no change.
const [clicked, click] = createEventEmitter();

const steps = clicked.pipe(map(() => 1, { equals: () => false }));

const position = steps.pipe(scan((sum, step) => sum + step, 0));

click();

click();

assert.strictEqual(position.value, 2);
```

`skipIfNoChange` exists for the other case: an event source whose repeated values you do want to drop, or a comparison of your own.

## Reading without following: `withCurrentValueFrom`

A parent wakes its children. Sometimes a value should only be read: the text of a form when it is submitted, not every keystroke. `withCurrentValueFrom(other)` pairs each value of the source with the value `other` holds, settled for the same update, and a change of `other` alone emits nothing:

```tsx
import {
    createEventEmitter,
    createState,
    map,
    withCurrentValueFrom,
} from 'synstate-next';

const [draft, setDraft] = createState('');

const [submitted, submit] = createEventEmitter();

// What the draft holds when the form is submitted. Typing alone sends
// nothing: `draft` is read, not followed.
const sent = submitted.pipe(
    withCurrentValueFrom(draft),
    map(([, text]) => text, { equals: () => false }),
);

const mut_sent: string[] = [];

sent.subscribe((text) => {
    mut_sent.push(text);
});

setDraft('h');

setDraft('hello');

submit();

submit();

assert.deepStrictEqual(mut_sent, ['hello', 'hello']);
```

`withBufferedFrom(other)` is the same with every value `other` emitted since the previous one.
