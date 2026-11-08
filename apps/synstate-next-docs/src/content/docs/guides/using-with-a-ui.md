---
title: Using it with a UI
description: synstate-dom-next, the UI library built for synstate-next, and how to connect synstate-next to any other framework.
---

## synstate-dom-next

[synstate-dom-next](/mono/synstate-dom-next/) is the UI library made for synstate-next. You pass observables straight into JSX, a component runs once, and each attribute, property and text you bound is an effect of synstate-next's graph: it runs after the update has settled, once, with nothing diffed. Mounting is a batch, and a switch decides in the drain which branches to drop, so no branch computes from a value that rules it out. There is no adapter in between: the graph you build with the operators on this site ends in the DOM.

## Any other framework

React and Preact hooks and the Preact Signals bridge have not been rebuilt for synstate-next yet. What a framework needs is small: a way to be told that something changed, and a way to read the value. React's `useSyncExternalStore` takes exactly that:

```tsx
import {
    createState,
    map,
    type InitializedObservable,
    type Unsubscribe,
} from 'synstate-next';

// What React's `useSyncExternalStore` and similar hooks take.
type ExternalStore<A> = Readonly<{
    subscribe: (onStoreChange: () => void) => Unsubscribe;
    getSnapshot: () => A;
}>;

const toExternalStore = <A,>(
    observable: InitializedObservable<A>,
): ExternalStore<A> => {
    const store: ExternalStore<A> = {
        subscribe: (onStoreChange) =>
            observable.subscribe(() => {
                onStoreChange();
            }),
        getSnapshot: () => observable.value,
    };

    return store;
};

const [count, setCount] = createState(0);

const label = toExternalStore(count.pipe(map((n) => `count: ${n}`)));

// In a React component:
// const text = useSyncExternalStore(label.subscribe, label.getSnapshot);

let mut_changes = 0;

const unsubscribe = label.subscribe(() => {
    mut_changes += 1;
});

setCount(1);

assert.strictEqual(label.getSnapshot(), 'count: 1');

unsubscribe();

// Called once at subscription, once for the change.
assert.strictEqual(mut_changes, 2);
```

Two things to keep in mind:

- **Subscribe where the framework can unsubscribe.** A subscription made outside every owner lives until its `Unsubscribe` is called; return it from the effect that made it.
- **Keep the logic in the graph.** Derive what a component shows with `map` and `derive` outside it, and give the component the result. The component then re-renders only when that result changes, and the equality cut-off has already dropped every update that would not change it.
