---
title: Why there is no completion
description: What completion did in synstate, why each of its jobs is done otherwise in synstate-next — owners, nodes that leave their parents, settled asked where it is used — and what that saves.
---

synstate, like RxJS, had a second signal beside the values: **completion**, an observable saying "I will emit no more", sent down the graph to everything derived from it. synstate-next has none. This page says what completion was for, and what does each of its jobs now.

## What completion did

In synstate, completion had four jobs:

1. **Telling an operator that an input is over.** `mergeMap` and `switchMap` had to know when an inner observable could emit no more, to let it go; `zip` to stop once a parent ran out; a parent completing completed its children once none of their parents was live.
2. **Freeing the graph.** A completed observable left its parents, and what nobody depended on any more could be collected. Completion was how a finished `take(1)` or a fired `timer` released what it held.
3. **Ending something that waits for the end.** `collectToArray` resolved a promise with every value once its source completed, and a subscriber could pass an `onComplete`.
4. **Telling a pending value to come out.** A `debounce` or an `audit` holding a value when its source completed passed it on (`flush`), so nothing was lost at the end of a stream.

Each job made every operator responsible for passing completion on correctly, in the right order relative to the values, during an update or after it (`completeAfterPropagation`). An operator that forgot left the graph below it alive forever.

## What does each job now

| Job                        | synstate                       | synstate-next                                                                  |
| :------------------------- | :----------------------------- | :----------------------------------------------------------------------------- |
| An input is over           | Completion pushed down         | `settled`, **asked** where the answer is used                                  |
| Freeing the graph          | Completed nodes leave          | Owners dispose; a node that is done leaves its parents by itself               |
| Waiting for the end        | `collectToArray`, `onComplete` | Gone: a value that ends is a promise, and an owner's end is `onCleanup`        |
| A pending value at the end | `flush` on completion          | Gone with completion: disposing drops it, as `dispose` already did in synstate |

### Owners are the lifetime

Memory is released by disposal, and disposal follows ownership: everything made while an owner runs belongs to it ([Owners and lifetime](/mono/synstate-next/guides/owners-and-lifetime/)). A dialog's derived values, timers and requests go when the dialog's owner is disposed, whether any of them finished or not. Nothing needs to travel down the graph for that, and nothing needs counting.

### A node that is done leaves its parents

A `take`, `takeWhile` or `takeUntil` that will pass nothing more takes itself out of its parents' children, keeping its value. Its parents neither visit it nor keep it alive, and its own subscribers simply receive nothing more:

```tsx
import { createRootOwner, createState, take, timer } from 'synstate-next';

const [a, setA] = createState(0);

// The value held at the start counts: 0, 1, 2.
const firstThree = a.pipe(take(3));

const mut_seen: number[] = [];

firstThree.subscribe((x) => {
    mut_seen.push(x);
});

setA(1);

setA(2);

// Done: it has left `a`, keeps its value, and passes nothing more.
setA(3);

assert.deepStrictEqual(mut_seen, [0, 1, 2]);

assert.strictEqual(firstThree.value, 2);

// A source that is done keeps its value and its subscribers until its
// owner disposes it.
const owner = createRootOwner();

const fired = owner.run(() => timer(100));

await vi.advanceTimersByTimeAsync(100);

assert.strictEqual(fired.getSnapshot(), 0);

owner.dispose();
```

### `settled` is asked, not announced

An operator that follows inner observables (`mergeMap`, a `switchMap` that may hold one finished request) still needs to know when one can emit no more. Each node answers `settled` when asked: a source once it is disposed or its timer, promise or subscription is over; a derived node once every parent is settled and it waits on nothing of its own (a `debounce` timer, an inner observable). `mergeMap` asks when an inner observable is projected or emits, and lets it go once it is settled and the effects of its update have read what it emitted. An operator written with `createDerived` gives its own `settled` when it emits later than the update that made it recompute ([Custom operators and sources](/mono/synstate-next/guides/custom-operators-and-sources/#an-async-operator)).

Asking where the answer is used costs nothing elsewhere: no operator forwards a signal it does not care about, and none can forget to.

## What that saves

- **One kind of thing travels the graph.** An update carries values and nothing else, so its order is the order of depth and nothing has to be interleaved with it.
- **Operators are shorter.** An operator is a `recompute` and, if it emits later, a `settled`. synstate's operators each had a completion path beside the value path.
- **No leak by a forgotten signal.** Lifetime does not depend on every operator between a source and a subscriber passing completion on.
