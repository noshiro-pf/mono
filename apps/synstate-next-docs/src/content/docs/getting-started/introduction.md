---
title: Introduction
description: What synstate-next is, and a first look at states, derived values and subscribers.
---

synstate-next is a state management library for TypeScript built on observables. You keep your application's state in states, declare the values derived from them with operators, and subscribe to what you show. When a state changes, synstate-next brings every derived value up to date in one glitch-free update, and then calls the subscribers.

:::caution
synstate-next and synstate-dom-next are private packages in the repository, to be released as the next major versions of synstate and synstate-dom. They are not published, and their API may change until then. If you use synstate today, [Changes from synstate](/mono/synstate-next/background/changes-from-synstate/) lists what is different.
:::

## Features

- **Simple state, shared anywhere.** `createState` gives a state and its setter, and `createReducer` a state and its dispatch, as React's `useState` and `useReducer` do, for state the whole application shares, and a pipeline that reads them runs the same in a component, a test or a script.
- **Async operators built in.** `debounce`, `throttle`, `switchMap` and `fromAbortablePromise` turn a timer, a cancellation or "the latest answer only" into one line of a pipeline.
- **Glitch-free, at linear cost.** An update visits the values it reaches in order of depth, each once, after all of its parents. A value derived from two others never sees one of them updated and the other not. The same holds through `debounce` and `switchMap`, which signal libraries write as effects; what that costs them is in [Operators on signals](/mono/synstate-next/comparison/operators-on-signals/).
- **Subscribers run after the update.** A subscriber is called once the update has reached every value it changes, so whatever else it reads is up to date. The one exception: when a subscriber called earlier for the same update writes a state, the values derived from that state catch up only in the next update. A write it makes starts the next update instead of interrupting this one.
- **Unchanged values stop the update.** A derived value that comes out the same as before passes nothing on, and what depends on it is not visited.
- **Cancellation is built in.** With `fromAbortablePromise` inside `switchMap`, a newer query aborts the request it replaces, and work started inside an owner (the requests, timers and subscriptions of a dialog, say) stops with one `dispose()` of that owner.
- **Types that say whether there is a value.** `InitializedObservable<A>` always holds one and has `.value`; `Observable<A>` may hold none yet. `pipe` computes which one an operator chain gives.

## Quick example

:::note
Every example on this site is a file run by the test suite. `assert` and `vi` are Vitest's, there to show what the code does; a helper such as `fetchUser` stands for your own code, and a comment says what it does.
:::

`createState` returns the state, its setter, and the rest of what you can do with it:

```tsx
import { createState } from 'synstate-next';

const [count, setCount, { updateState }] = createState(0);

const mut_seen: number[] = [];

// Called at once with the value held, then after every update.
count.subscribe((value) => {
    mut_seen.push(value);
});

setCount(1);

updateState((n) => n + 1);

assert.deepStrictEqual(mut_seen, [0, 1, 2]);

assert.strictEqual(count.value, 2);
```

`subscribe` calls its function with the value held, then after every update that changes it. An update is over by the time `setCount` returns: synstate-next is synchronous, and the asynchronous part of an application comes only from the asynchronous operators and sources (`debounce`, `fromPromise`, `timer`, …).

## Deriving values with `pipe`

`pipe` applies one operator, and a chain of `pipe` calls applies several. Each operator says in its type whether the result keeps the value held at the start (`map`), may drop it (`filter`), or always provides one (`scan`, `withInitialValue`), so the type of the result tells you whether you can read `.value` or have to read the `Optional` that `getSnapshot()` returns:

```tsx
import {
    createState,
    filter,
    map,
    type InitializedObservable,
    type Observable,
} from 'synstate-next';
import { expectType } from 'ts-data-forge';
import { Optional } from 'ts-std-forge';

const [count, setCount] = createState(1);

// `map` keeps the value held at the start: the result always holds one.
const doubled = count.pipe(map((n) => n * 2));

expectType<typeof doubled, InitializedObservable<number>>('=');

// `filter` may drop it: the result may hold none.
const even = count.pipe(filter((n) => n % 2 === 0));

expectType<typeof even, Observable<number>>('=');

assert.strictEqual(doubled.value, 2);

assert.isTrue(Optional.isNone(even.getSnapshot()));

setCount(4);

assert.strictEqual(doubled.value, 8);

assert.deepStrictEqual(even.getSnapshot(), Optional.some(4));
```

## Next steps

- [Installation](/mono/synstate-next/getting-started/installation/) adds synstate-next to a package of the repository.
- [Why synstate-next](/mono/synstate-next/guides/why-synstate-next/) says what the design buys you, and [Declarative state](/mono/synstate-next/guides/declarative-state/) shows it on a data table with filters.
- [How an update propagates](/mono/synstate-next/internals/how-an-update-propagates/) follows an update from a write to the subscribers.
