---
title: Async operators
description: debounce, throttle and audit; switchMap and mergeMap with promises; timer and counter; fromSubscribable.
---

The asynchronous operators and sources are where an application's time comes from. Each value they produce later is an update of its own, run as any write is.

## `debounce`, `throttle` and `audit`

Three ways to tame a burst:

- `debounce(ms)`: the last value, once `ms` pass without another.
- `throttle(ms)`: the first value at once, then nothing for `ms`.
- `audit(ms)`: the latest value, `ms` after the first of a burst.

```tsx
import { audit, debounce, source, throttle } from 'synstate-next';

const keys = source<string>();

const mut_debounced: string[] = [];

const mut_throttled: string[] = [];

const mut_audited: string[] = [];

// The last value, once 100 ms pass without another.
keys.pipe(debounce(100)).subscribe((k) => {
    mut_debounced.push(k);
});

// The first value at once, then nothing for 100 ms.
keys.pipe(throttle(100)).subscribe((k) => {
    mut_throttled.push(k);
});

// The latest value, 100 ms after the first of a burst.
keys.pipe(audit(100)).subscribe((k) => {
    mut_audited.push(k);
});

keys.next('a');

await vi.advanceTimersByTimeAsync(40);

keys.next('b');

await vi.advanceTimersByTimeAsync(40);

keys.next('c');

await vi.advanceTimersByTimeAsync(200);

assert.deepStrictEqual(mut_debounced, ['c']);

assert.deepStrictEqual(mut_throttled, ['a']);

assert.deepStrictEqual(mut_audited, ['c']);
```

On a state, each of them holds the value the state holds at the start, so the result is still an `InitializedObservable`. Disposing one drops a value still waiting.

## `switchMap`: only the latest

`switchMap(project)` follows the observable `project` returns for the latest value, and disposes the one it followed before. With a request, that means an answer that comes back after a newer request was made is never seen:

```tsx
import {
    createState,
    fromPromise,
    just,
    switchMap,
    type Observable,
} from 'synstate-next';
import { Result } from 'ts-std-forge';

type User = Readonly<{ id: number; name: string }>;

const [selectedId, setSelectedId] = createState<number | undefined>(undefined);

// `fetchUser(id, ms)` stands for a request: it resolves to the user after
// `ms` milliseconds.
const user: Observable<Result<User | undefined, unknown>> = selectedId.pipe(
    switchMap((id): Observable<Result<User | undefined, unknown>> =>
        // A branch with nothing to wait for is `just(...)`.
        id === undefined
            ? just(Result.ok(undefined))
            : fromPromise(fetchUser(id, id === 1 ? 300 : 100)),
    ),
);

const mut_names: (string | undefined)[] = [];

user.subscribe((result) => {
    if (Result.isOk(result)) {
        mut_names.push(result.value?.name);
    }
});

setSelectedId(1);

// The answer for user 1 comes after the one for user 2 and is dropped:
// `switchMap` follows only the latest request.
setSelectedId(2);

await vi.advanceTimersByTimeAsync(500);

assert.deepStrictEqual(mut_names, [undefined, 'user 2']);
```

What a projection creates belongs to an owner of its own, disposed when the next value replaces it: a `fromAbortablePromise` made there is aborted, a `timer` cleared. A branch that has nothing to wait for is `just(value)`, and one that should follow nothing is `empty()`.

## `mergeMap`: every one of them

`mergeMap(project)` follows every observable `project` returns, and lets each one go once it can emit no more (a promise that settled, a timer that fired). Every value is delivered, in the order they arrive:

```tsx
import { createValueEmitter, fromPromise, mergeMap } from 'synstate-next';
import { Result } from 'ts-std-forge';

const [fileChosen, chooseFile] =
    createValueEmitter<Readonly<{ name: string; size: number }>>();

// `upload(name, size)` stands for a request that takes longer for a bigger
// file.
// Every upload runs to the end, and each outcome is delivered, in the
// order they come.
const uploaded = fileChosen.pipe(
    mergeMap((file) => fromPromise(upload(file.name, file.size))),
);

const mut_done: string[] = [];

uploaded.subscribe((result) => {
    if (Result.isOk(result)) {
        mut_done.push(result.value);
    }
});

chooseFile({ name: 'big.png', size: 300 });

chooseFile({ name: 'small.png', size: 100 });

await vi.advanceTimersByTimeAsync(500);

assert.deepStrictEqual(mut_done, ['small.png uploaded', 'big.png uploaded']);
```

## `timer` and `counter`

`timer(ms)` emits `0` once, `ms` after it is created; `counter(ms)` emits `0`, `1`, `2`, … every `ms`. Both start when they are created, so create one where it should start, inside the owner that should stop it:

```tsx
import { counter, createRootOwner, timer } from 'synstate-next';

const owner = createRootOwner();

const mut_ticks: number[] = [];

owner.run(() => {
    // Starts now, where it is created, and belongs to `owner`.
    const ticks = counter(1000);

    ticks.subscribe((n) => {
        mut_ticks.push(n);
    });

    // Emits `0` once, after 500 ms, and settles.
    const delay = timer(500);

    delay.subscribe(() => {
        mut_ticks.push(-1);
    });
});

await vi.advanceTimersByTimeAsync(2500);

assert.deepStrictEqual(mut_ticks, [0, -1, 1, 2]);

// Disposing the owner clears the counter's timer.
owner.dispose();

await vi.advanceTimersByTimeAsync(5000);

assert.deepStrictEqual(mut_ticks, [0, -1, 1, 2]);
```

## Promises and other libraries

- `fromPromise(promise)` emits `Result.ok(value)` or `Result.err(error)` once, and settles.
- `fromAbortablePromise((signal) => promise)` does the same, and aborts the signal when it is disposed, whether or not the promise has settled, so read a response body inside the factory, as the examples do: one read later may be cut off. A rejection that follows emits nothing.
- `fromSubscribable(subscribable)` follows anything subscribed to with an observer object (`next`, `error`, `complete`), as an RxJS observable or a TC39 `Observable` is. Each value arrives as `Result.ok`, an error as `Result.err`.

```tsx
import { fromSubscribable, type Subscribable } from 'synstate-next';
import { Result } from 'ts-std-forge';

// Anything subscribed to with an observer object: an RxJS observable, a
// TC39 `Observable`, or this.
const words: Subscribable<string> = {
    subscribe: (observer) => {
        observer.next('hello');

        observer.next('world');

        observer.complete();

        return { unsubscribe: () => {} };
    },
};

const followed = fromSubscribable(words);

// A value given while it subscribes is held from the start.
assert.deepStrictEqual(followed.peek(), Result.ok('world'));
```
