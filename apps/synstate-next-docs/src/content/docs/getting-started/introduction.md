---
title: Introduction
description: What synstate-next is, and a first look at states, derived values and subscribers.
---

synstate-next is a state management library for TypeScript built on observables. You keep your application's state in states, declare the values derived from them with operators, and subscribe to what you show. When a state changes, synstate-next brings every derived value up to date in one glitch-free update, and then calls the subscribers.

:::caution
synstate-next and synstate-dom-next are a from-scratch rebuild of synstate and synstate-dom, kept as private packages in the repository until they replace the current ones in their next major versions. They are not published, and their API may change until then. What changed from synstate is listed in [Changes from synstate](/mono/synstate-next/background/changes-from-synstate/).
:::

## Features

- **Glitch-free, at linear cost.** An update visits the nodes it reaches in order of depth, each once, after all of its parents. A value derived from two others never sees one of them updated and the other not.
- **Subscribers run on a settled graph.** A subscriber is called after the update has reached every node, not in the middle of it. A write made by a subscriber starts the next update, and a write made in the drain waits for the round to end.
- **Equality cut-off by default.** A derived value that recomputes to the value it holds passes nothing on: what is below it is not visited.
- **Owners instead of completion.** Everything created while an owner runs belongs to it, and disposing the owner disposes all of it. There is no `complete` to send or to forget.
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

`pipe` applies operators in order. Each operator says in its type whether the result keeps the value held at the start (`map`), may drop it (`filter`), or always provides one (`scan`, `withInitialValue`), so the type of the result tells you whether you can read `.value` or have to ask `hasValue`:

```tsx
import {
    createState,
    filter,
    map,
    type InitializedObservable,
    type Observable,
} from 'synstate-next';
import { expectType } from 'ts-data-forge';

const [count, setCount] = createState(1);

// `map` keeps the value held at the start: the result always holds one.
const doubled = count.pipe(map((n) => n * 2));

expectType<typeof doubled, InitializedObservable<number>>('=');

// `filter` may drop it: the result may hold none.
const even = count.pipe(filter((n) => n % 2 === 0));

expectType<typeof even, Observable<number>>('=');

assert.strictEqual(doubled.value, 2);

assert.isFalse(even.hasValue);

setCount(4);

assert.strictEqual(doubled.value, 8);

assert.strictEqual(even.peek(), 4);
```

## Next steps

- [Installation](/mono/synstate-next/getting-started/installation/) adds synstate-next to a package of the repository.
- [Why synstate-next](/mono/synstate-next/guides/why-synstate-next/) says what the design buys you, and [Declarative state](/mono/synstate-next/guides/declarative-state/) shows it on a data table with filters.
- [How an update propagates](/mono/synstate-next/internals/how-an-update-propagates/) follows an update from a write to the subscribers.
