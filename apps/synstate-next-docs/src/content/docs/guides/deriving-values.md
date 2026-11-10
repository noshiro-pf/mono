---
title: Deriving values
description: pipe and the three kinds of operator, derive, merge and zip, stopping where a value does not change, and reading a value without following it.
---

## `pipe`

`observable.pipe(op)` applies one operator; chain `pipe` for more, as in `a.pipe(map(f)).pipe(filter(p))`. Each operator's type says what it does to the value held at the start, in what it takes and returns:

| Operator type                 | Meaning                                  | Operators                                                                                                                                      |
| :---------------------------- | :--------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| `KeepInitialValueOperator`    | Holds a value when its source does       | `map`, `debounce`, `throttle`, `audit`, `take`, `takeUntil`, `skipIfNoChange`, `keepEqualParts`, `withBufferedFrom`                            |
| `DropInitialValueOperator`    | May hold none, whatever its source holds | `filter`, `skip`, `takeWhile` (`Keep` with `inclusive`), `skipWhile`, `skipUntil`, `pairwise`, `switchMap`, `mergeMap`, `withCurrentValueFrom` |
| `ProvideInitialValueOperator` | Always holds one                         | `scan`, `withInitialValue`                                                                                                                     |

`pipe` turns the operator's type into the type of the result: an `InitializedObservable<A>`, which has `.value`, or an `Observable<A>`, whose value `getSnapshot()` gives as an `Optional`. See the [introduction](/mono/synstate-next/getting-started/introduction/#deriving-values-with-pipe) for an example.

The kind is in the types the operator takes and returns, not in a label beside them: a `ProvideInitialValueOperator` returns an `InitializedObservable`, so an operator you write that may return an observable with no value does not type-check as one without a cast.

## `derive`

`derive(parents, fn)` computes one value from several observables, once per update however many of them changed, and passes it on unless it equals the one held. A `fn` that returns its arguments as a tuple gives the latest values themselves, on every update that reaches it: a new tuple each time, so it never stops there.

```tsx
import { batch, createState, derive } from 'synstate-next';

const [price, setPrice] = createState(100);

const [quantity, setQuantity] = createState(2);

// Computed once per update, however many parents changed.
const total = derive([price, quantity], (p, q) => p * q);

assert.strictEqual(total.value, 200);

// The latest values as a tuple.
const pair = derive([price, quantity], (p, q) => [p, q] as const);

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

// 50 × 4 is 200 again: `total` stops the update there. `pair` builds a new
// tuple on every update, so it never does.
assert.deepStrictEqual(mut_totals, [200]);

assert.deepStrictEqual(mut_pairs, ['100 × 2', '50 × 4']);
```

Compute the value you need in `fn` itself: it is computed once, and an unchanged result stops the update. Return the tuple only where you need it as such, as the input of a `debounce`, say. Either way the result holds a value once every parent holds one.

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

## Stopping where a value does not change

Every node that computes a value (`map`, `derive`, a state's write) compares it with the one it holds, by `Object.is` unless you pass `equals`, and passes nothing on when they are equal. Nothing below it is visited. `switchMap` compares, by `Object.is`, only when it switches: the value the new inner observable holds stops there when it equals the one held, and what the inner observable emits later passes through. The operators that only pass values on (`filter`, `take`, …) pass what reached them, and those that pass events (`merge`, `zip`, `scan`, `pairwise`, the time operators) never compare.

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

A parent makes its children recompute. Sometimes a value should only be read: the text of a form when it is submitted, not every keystroke. `withCurrentValueFrom(other)` pairs each value of the source with the value `other` holds, up to date for the same update, and a change of `other` alone emits nothing:

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
const sent = submitted
    .pipe(withCurrentValueFrom(draft))
    .pipe(map(([, text]) => text, { equals: () => false }));

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
