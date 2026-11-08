---
title: Custom operators and sources
description: Write an operator with createDerived and a source with createSource, built on the same classes as the operators and sources of the package.
---

An operator is a function from one observable to another. When the operators of the package do not express what you need, `createDerived` builds a node that follows parents of your choosing, and `createSource` one that emits by itself. Both make the same kind of node as the package's own operators, so yours take part in the update in the same order and with the same rules.

## A sync operator

`createDerived(parents, setup)` runs `setup` once, at creation. It returns `update`, which is called in each update in which a parent emitted. `update` reads its parents and calls `ctx.set(value)` to pass a value on in this update; not calling it passes nothing on.

```tsx
import {
    createDerived,
    createState,
    type DropInitialValueOperator,
    type Observable,
} from 'synstate-next';

// Passes on the values that are not `undefined`.
const defined =
    <A,>(): DropInitialValueOperator<A | undefined, A> =>
    (source: Observable<A | undefined>): Observable<A> =>
        createDerived<A>([source], (ctx) => () => {
            const value = source.getSnapshot();

            if (value !== undefined) {
                ctx.set(value);
            }
        });

const [selected, setSelected] = createState<string | undefined>(undefined);

const lastSelected = selected.pipe(defined());

assert.isFalse(lastSelected.hasValue);

setSelected('a');

setSelected(undefined);

assert.strictEqual(lastSelected.getSnapshot(), 'a');
```

The node holds nothing until it is first set, unless you give `{ initialValue }`. Typing the operator as a `DropInitialValueOperator<A, B>` (or a `KeepInitialValueOperator`, a `ProvideInitialValueOperator`) tells `pipe` whether the result holds a value. The last two return an `InitializedObservable`, so a node that may hold nothing needs `{ initialValue }` to be one. `pipe` also applies a `KeepInitialValueOperator` to an observable that holds no value yet, so its body must not count on its source holding one, and a node made here cannot know the value it would have to start with: write a `KeepInitialValueOperator` by chaining operators that keep, as a function typed as one (`const k: KeepInitialValueOperator<A, B> = (o) => o.pipe(map(f)).pipe(debounce(ms))`; written inline in `pipe`, the operator gets an `Observable` and its result is one), and type one made with `createDerived` as a `DropInitialValueOperator`. Called directly, a `KeepInitialValueOperator` takes only an `InitializedObservable`, so write `source.pipe(map(f))` rather than `map(f)(source)`.

## Several parents

A node with several parents is recomputed when any of them emits. `ctx.emitted(parent)` says which of them did in this update:

```tsx
import {
    createDerived,
    createValueEmitter,
    type Observable,
} from 'synstate-next';

type Tagged<A, B> = Readonly<
    { from: 'left'; value: A } | { from: 'right'; value: B }
>;

// Like `merge`, but says which parent the value came from.
const mergeTagged = <A, B>(
    first: Observable<A>,
    second: Observable<B>,
): Observable<Tagged<A, B>> =>
    createDerived<Tagged<A, B>>([first, second], (ctx) => () => {
        const a = first.getSnapshot();

        const b = second.getSnapshot();

        // `emitted` tells which parent emitted in this update.
        if (a !== undefined && ctx.emitted(first)) {
            ctx.set({ from: 'left', value: a });
        } else if (b !== undefined && ctx.emitted(second)) {
            ctx.set({ from: 'right', value: b });
        }
    });

const [left, emitLeft] = createValueEmitter<number>();

const [right, emitRight] = createValueEmitter<string>();

const mut_seen: Tagged<number, string>[] = [];

mergeTagged(left, right).subscribe((tagged) => {
    mut_seen.push(tagged);
});

emitLeft(1);

emitRight('a');

assert.deepStrictEqual(mut_seen, [
    { from: 'left', value: 1 },
    { from: 'right', value: 'a' },
]);
```

## An async operator

A value that comes later than the update that made the node recompute is passed on with `ctx.emit(value)`, in an update of its own. Such an operator gives `settled` too, so that it is not taken for done while a value is still due: `mergeMap` lets go of an inner observable once it is settled. Register what to stop with `ctx.onCleanup`:

```tsx
import {
    createDerived,
    source,
    type DropInitialValueOperator,
    type Observable,
} from 'synstate-next';

// Passes each value on `milliseconds` later, in an update of its own.
const delay =
    <A,>(milliseconds: number): DropInitialValueOperator<A, A> =>
    (parent: Observable<A>): Observable<A> =>
        createDerived<A>([parent], (ctx) => {
            const mut_timers = new Set<ReturnType<typeof setTimeout>>();

            ctx.onCleanup(() => {
                for (const id of mut_timers) {
                    clearTimeout(id);
                }
            });

            return {
                update: () => {
                    const value = parent.getSnapshot();

                    if (value === undefined || !ctx.emitted(parent)) {
                        return;
                    }

                    const id = setTimeout(() => {
                        mut_timers.delete(id);

                        ctx.emit(value);
                    }, milliseconds);

                    mut_timers.add(id);
                },
                // Not done while a value is still due.
                settled: () => parent.settled && mut_timers.size === 0,
            };
        });

const messages = source<string>();

const delayed = messages.pipe(delay(100));

const mut_seen: string[] = [];

delayed.subscribe((m) => {
    mut_seen.push(m);
});

messages.emit('a');

messages.emit('b');

assert.deepStrictEqual(mut_seen, []);

await vi.advanceTimersByTimeAsync(100);

assert.deepStrictEqual(mut_seen, ['a', 'b']);
```

`setup` runs with the node as the current owner: what it creates and the cleanups it registers belong to the node, and disposing the node runs the cleanups, newest first, before disposing what it created.

## A source

`createSource(setup)` makes a source that emits by itself, from another library or an event. `ctx.emit` passes a value on in an update of its own; `ctx.end()` says it will emit no more; `ctx.onCleanup` registers what disposal undoes.

```tsx
import { createRootOwner, createSource, type Observable } from 'synstate-next';

const fromEvent = (target: EventTarget, type: string): Observable<Event> =>
    createSource<Event>((ctx) => {
        const listener = (event: Event): void => {
            ctx.emit(event);
        };

        target.addEventListener(type, listener);

        // Runs when the source is disposed, with its owner or by itself.
        ctx.onCleanup(() => {
            target.removeEventListener(type, listener);
        });
    });

const button = new EventTarget();

const owner = createRootOwner();

const mut_types: string[] = [];

owner.run(() => {
    fromEvent(button, 'click').subscribe((event) => {
        mut_types.push(event.type);
    });
});

button.dispatchEvent(new Event('click'));

owner.dispose();

// The listener was removed.
button.dispatchEvent(new Event('click'));

assert.deepStrictEqual(mut_types, ['click']);
```

## What you cannot do

- **Read an observable that is not a parent from `update`.** A node is placed below its parents, so it reads their values once they are up to date. Another observable may not have been recomputed yet in this update. Make it a parent, and ask `ctx.emitted` which parent emitted in this update.
- **Create nodes in `update`.** `update` runs in the update, outside any owner, so a node made there belongs to none: it is never disposed, stays attached to its parents and is recomputed with them from then on. Create what the node needs in `setup`.
- **Follow a node you create yourself.** A node made in `setup` is not a parent: it is visited in the same update as this one, not before it, so `update` would read its value from before the update. What `setup` creates is for work on the side (a subscription, a listener). An operator that follows observables it creates is a `switchMap` or a `mergeMap`.
- **Combine observables from two copies of synstate-next.** `createDerived` throws for a parent from another copy.
