---
title: 'Custom Operators and Creators'
description: How to write your own operators and creation functions with the factories every built-in observable is made by.
sidebar:
    order: 5
---

Every built-in observable in SynState is made by one of four factories, and the same factories are exported for you. A custom operator or creator built with them takes part in glitch-free propagation exactly as `map` or `source` do.

| Factory                                | Makes                                                | Built-ins made with it            |
| :------------------------------------- | :--------------------------------------------------- | :-------------------------------- |
| `createRootObservable`                 | an observable with no parents (`kind: 'root'`)       | `source`, `timer`, `fromPromise`  |
| `createSyncChildObservable`            | a child that emits in its parents' update            | `map`, `filter`, `combine`, `zip` |
| `createInitializedSyncChildObservable` | the same, typed as always holding a value            | `scan`, `withInitialValue`        |
| `createAsyncChildObservable`           | a child that may emit later, in an update of its own | `debounce`, `audit`, `switchMap`  |

The names follow `kind`, which every observable carries and which a debugger shows: `'root'`, `'sync child'` and `'async child'`.

## A sync operator

A child factory takes a config and an `init` callback. `init` runs once, while the observable is created; it receives the tools the new observable may use on itself and returns `tryUpdate`, which SynState calls with the token of every update in which at least one parent of the observable emitted.

```ts
import { Optional } from 'ts-data-forge';
import { createSyncChildObservable, type Observable } from 'synstate';

export const double = (src: Observable<number>): Observable<number> =>
    createSyncChildObservable(
        { parents: [src], initialValue: Optional.none },
        ({ setNext }) =>
            (updateToken) => {
                const sn = src.getSnapshot();

                if (src.updateToken !== updateToken || Optional.isNone(sn)) {
                    return; // the parent did not emit in this update
                }

                setNext(sn.value * 2, updateToken);
            },
    );
```

`src.updateToken` is the token of the update in which `src` last emitted. When it differs from the token `tryUpdate` received, `src` was skipped in this update (a `filter` above it rejected the value, say), and so is `double`. Emitting is `setNext` with the token received; not calling it is how a child skips, and its own children see that through the same comparison.

With more than one parent, compare each parent's token: `combine` emits when any parent did, `zip` queues the values of those that did.

### Depth, and reading an observable that is not a parent

An update reaches observables in ascending `depth`, which is how SynState avoids glitches: every parent has emitted before its child reads it. A child's `depth` defaults to one more than its deepest parent. `withCurrentValueFrom` also reads a second observable with `getSnapshot` without being derived from it; such an observable has to be shallower too, or your observable reads its value from before the update. Pass `depth` yourself then.

```ts
createSyncChildObservable(
    {
        parents: [src],
        depth: 1 + Math.max(src.depth, other.depth),
        initialValue: Optional.none,
    },
    ({ setNext }) =>
        (updateToken) => {
            // …
        },
);
```

### Config

| Field          | Meaning                                                                                                                      |
| :------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| `parents`      | The observables this one is derived from                                                                                     |
| `initialValue` | `Optional.some(v)` or `Optional.none`                                                                                        |
| `depth`        | Defaults to one more than the deepest parent's; must also be greater than that of any observable read without being a parent |

### Tools

| Tool                         | Meaning                                                                                                |
| :--------------------------- | :----------------------------------------------------------------------------------------------------- |
| `setNext(value, token)`      | Emit `value` in the update `token` names                                                               |
| `getSnapshot()`              | This observable's current value                                                                        |
| `complete()`                 | Complete this observable now                                                                           |
| `completeAfterPropagation()` | Complete it once the current update has reached every descendant (`take`)                              |
| `onComplete(teardown)`       | Register a teardown (clear timers, unsubscribe), run once when the observable completes or is disposed |
| `startUpdate(value)`         | Async children only: emit `value` in a new update of its own                                           |

### Returning more than `tryUpdate`

`init` may return an object instead of `tryUpdate` alone, when the operator has to answer more than updates. The hooks read the state `init` creates, so it lives in one place.

| Hook            | Meaning                                                                                                    |
| :-------------- | :--------------------------------------------------------------------------------------------------------- |
| `tryUpdate`     | Called with the token of every update in which a parent of the observable emitted                          |
| `canEmitNoMore` | Asked when a parent completes; `true` completes this observable although some parent is still live (`zip`) |
| `flush`         | Async children only: passes on a pending value through `startUpdate` before completing, never on `dispose` |

## An async operator

An async child emits later through `startUpdate`, which starts an update of its own and propagates it to everything derived from the observable. The timers are created in `init`, next to the teardown that clears them. `debounce` also returns a `flush` that passes on the value its timer still holds when it completes.

```ts
import { Optional } from 'ts-data-forge';
import { createAsyncChildObservable, type Observable } from 'synstate';

export const delay = (
    src: Observable<number>,
    ms: number,
): Observable<number> =>
    createAsyncChildObservable(
        { parents: [src], initialValue: Optional.none },
        ({ startUpdate, onComplete }) => {
            const mut_timers = new Set<ReturnType<typeof setTimeout>>();

            onComplete(() => {
                for (const t of mut_timers) {
                    clearTimeout(t);
                }
            });

            return (updateToken) => {
                const sn = src.getSnapshot();

                if (src.updateToken !== updateToken || Optional.isNone(sn)) {
                    return;
                }

                const t = setTimeout(() => {
                    mut_timers.delete(t);

                    startUpdate(sn.value);
                }, ms);

                mut_timers.add(t);
            };
        },
    );
```

## A creator

A root observable has no parents. `createRootObservable` takes a config and an `init` callback, which receives `startUpdate`, `getSnapshot`, `isCompleted`, `complete` and `onComplete`, and returns the members to add to the observable (`next` for `source`, `start` for `timer`; `{}` for none).

```ts
import { Optional } from 'ts-data-forge';
import { createRootObservable, type RootObservable } from 'synstate';

export const fromEvent = (
    target: EventTarget,
    type: string,
): RootObservable<Event> =>
    createRootObservable<Event>(
        { initialValue: Optional.none },
        ({ startUpdate, onComplete }) => {
            target.addEventListener(type, startUpdate);

            onComplete(() => {
                target.removeEventListener(type, startUpdate);
            });

            return {};
        },
    );
```

The `onComplete` tool registers a teardown from inside `init`, so it can close over what `init` creates (here the listener). Neither factory's config has an `onComplete`: teardowns run once, in the order registered, when the observable completes or is disposed; registered after the observable has completed (`init` may complete it synchronously), it runs at once.

## What you cannot do

The observable types carry only what users need: `kind`, `parents` (on children), `getSnapshot`, `isCompleted`, `updateToken`, `depth`, `subscribe`, `pipe`, `complete` and `dispose`. The members propagation reads (`tryUpdate`, `addChild`, …) exist at run time but are not part of the types, and the types cannot be satisfied with an object literal: every observable has to come from one of the factories above, because propagation relies on those members being there.
