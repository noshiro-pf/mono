---
title: Why synstate-next
description: What synstate-next gives an application — glitch-free updates at linear cost, subscribers that run once every value is up to date, updates that stop at unchanged values, cleanup in one place — and where it fits.
---

## Simple to start, powerful when you need it

A counter is a `createState` and a `subscribe`. The same model scales to an application: the values the screen shows are derived from a handful of states with `map`, `derive` and the asynchronous operators, and the graph they form decides the order in which everything is recomputed. Nothing else has to be learned to go from one to the other.

## Why observables

An observable is a value that changes over time and can be followed. That fits what a front end deals with: an input is a state, a click is an event, a request is a value that arrives later, a timer is a value that ticks. With one abstraction for all of them, a debounce, a cancellation or "the latest answer only" is an operator in a pipeline instead of a timer and a flag kept by hand. [Declarative state](/mono/synstate-next/guides/declarative-state/) shows the difference on a search box and a data table.

## Glitch-free, at linear cost

A glitch is a moment in which a value derived from two others has seen one of them change and not the other. In the diamond below, a library that pushes each change to its children at once computes `sum` from the new `tens` and the old `hundreds`, shows 120 for an instant, and then 220.

synstate-next queues the nodes an update reaches in a queue per depth and visits them shallowest first, so `sum` is computed once, after both of its parents:

```tsx
import { createState, derive, map } from 'synstate-next';

const [a, setA] = createState(1);

const tens = a.pipe(map((x) => x * 10));

const hundreds = a.pipe(map((x) => x * 100));

let mut_computed = 0;

const sum = derive([tens, hundreds], (t, h) => {
    mut_computed += 1;

    return t + h;
});

const mut_seen: number[] = [];

sum.subscribe((value) => {
    mut_seen.push(value);
});

setA(2);

// Never 120 or 210: `sum` is computed once per update, after both of its
// parents, and its subscriber runs once every value is up to date.
assert.deepStrictEqual(mut_seen, [110, 220]);

assert.strictEqual(mut_computed, 2);
```

Each node is visited at most once per update, so an update costs what it reaches, not more. How the queue works is in [How an update propagates](/mono/synstate-next/internals/how-an-update-propagates/).

## Subscribers run after the update

Many observable libraries call a subscriber as soon as its observable changes, in the middle of the update. synstate-next queues the subscriber instead, and runs it once every node the update reaches has been recomputed. A subscriber therefore finds every other value of the graph up to date, unless a subscriber called before it for the same update has written a state: it then reads that state's new value, and what derives from it still old. A write a subscriber makes is the next update rather than an update nested inside this one. The UI layer, synstate-dom-next, relies on this: its bindings run the same way, so mounting and unmounting a branch never happen in the middle of a propagation.

## Stops where a value does not change

Every node that computes a value (a `map`, a `derive`, a state's write) compares it with what it holds (`Object.is`, or the `equals` you give it), and passes nothing on when the two are equal. A filter that matches the same rows, a page count that stays the same, a boolean that stays `false`: the part of the graph below it is not visited at all. [Deriving values](/mono/synstate-next/guides/deriving-values/) shows when to turn it off.

## Cleanup in one place

An observable ends by being disposed, and disposal follows ownership: everything made while an owner runs belongs to that owner. A dialog that makes its own derived values, subscriptions and requests inside an owner closes all of them with one `dispose()`. Nothing travels down the graph to announce the end, so no operator can forget to pass it on. [Owners and lifetime](/mono/synstate-next/guides/owners-and-lifetime/) has the API, and [Why there is no completion](/mono/synstate-next/internals/why-no-completion/) the reasons.

## Use cases

- An application whose state is shared across screens and components, where the same derived values are read in many places.
- Asynchronous flows that need cancelling, debouncing or ordering: search boxes, autosave, polling, uploads.
- UI built with [synstate-dom-next](/mono/synstate-dom-next/), where the graph ends in the DOM itself.

## Next steps

- [State and writes](/mono/synstate-next/guides/state-and-writes/): `createState` and the rules for writes.
- [Deriving values](/mono/synstate-next/guides/deriving-values/): `pipe`, `derive`, `merge` and `zip`.
