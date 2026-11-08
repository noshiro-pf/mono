---
title: Owners and lifetime
description: createOwner, createRootOwner, run, dispose, onCleanup, getOwner and untracked — the one lifetime everything in synstate-next has.
---

## Everything belongs to an owner

An owner is a lifetime. Everything created while its `run` executes belongs to it: derived observables, subscriptions, timers, requests, the cleanups registered with `onCleanup`, and the owners created inside it. `dispose()` disposes them, newest first: the child owners, then the cleanups, then the observables.

```tsx
import { createRootOwner, createState, map, onCleanup } from 'synstate-next';

const [count, setCount] = createState(0);

const mut_log: string[] = [];

const owner = createRootOwner();

const doubled = owner.run(() => {
    const d = count.pipe(map((n) => n * 2));

    d.subscribe((value) => {
        mut_log.push(`doubled: ${value}`);
    });

    onCleanup(() => {
        mut_log.push('cleaned up');
    });

    return d;
});

setCount(1);

owner.dispose();

// The subscription and the derived node went with the owner.
setCount(2);

assert.deepStrictEqual(mut_log, ['doubled: 0', 'doubled: 2', 'cleaned up']);

assert.strictEqual(doubled.value, 2);
```

A disposed observable leaves the graph and never emits again; it keeps the value it last held.

## Nesting

`createOwner()` makes a child of the owner that is running, and `createRootOwner()` an owner with no parent, which only its own `dispose` disposes. A child can be disposed on its own, as a dialog closes before the page; disposing the parent disposes what is left of it.

```tsx
import {
    createOwner,
    createRootOwner,
    getOwner,
    onCleanup,
} from 'synstate-next';

const mut_log: string[] = [];

const page = createRootOwner();

const dialog = page.run(() => {
    onCleanup(() => {
        mut_log.push('page');
    });

    // A child of the owner that is running: `page`.
    const child = createOwner();

    child.run(() => {
        onCleanup(() => {
            mut_log.push('dialog');
        });
    });

    return child;
});

assert.strictEqual(dialog.parent, page);

// Closing the dialog alone.
dialog.dispose();

// Disposing the page disposes what is left of it.
page.dispose();

assert.deepStrictEqual(mut_log, ['dialog', 'page']);

// Outside every `run`, there is no current owner.
assert.isUndefined(getOwner());
```

synstate-dom-next builds its whole lifetime on this: `render` makes the root owner, and every branch of `If`, `Switch` and the other branch components, and every row of a list, mounts in an owner of its own.

## Outside every owner

Code that runs outside any `run` creates observables that nothing disposes. That is right for a module-level store that lives as long as the page, and wrong for anything that should end. `onCleanup` outside every owner warns, since its cleanup would never run.

## `untracked`

`untracked(fn)` runs `fn` with no current owner, so what it creates outlives the caller. Use it for something shared that the first caller happens to create, such as a cache:

```tsx
import {
    createRootOwner,
    createState,
    map,
    untracked,
    type InitializedObservable,
} from 'synstate-next';

const [count, setCount] = createState(1);

const mut_cache = new Map<string, InitializedObservable<number>>();

// A cache shared by every caller: what it creates must not go when the
// first caller's owner does.
const squared = (): InitializedObservable<number> => {
    const cached = mut_cache.get('squared');

    if (cached !== undefined) {
        return cached;
    }

    const created = untracked(() => count.pipe(map((n) => n ** 2)));

    mut_cache.set('squared', created);

    return created;
};

const first = createRootOwner();

const s = first.run(squared);

first.dispose();

setCount(3);

// Still following `count`.
assert.strictEqual(s.value, 9);
```

Subscribers, bindings and the recomputation of derived values always run with no owner current, so what a subscriber creates does not belong to whichever owner happened to make the write.

## No completion

There is no `complete`. A source that can emit no more (a `timer` that fired, a promise that settled) is **settled**: it keeps its value and its subscribers until its owner disposes it. Why the design dropped completion, and what replaces it inside the operators, is in [Why there is no completion](/mono/synstate-next/internals/why-no-completion/).
