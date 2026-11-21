---
title: Using it with a UI
description: synstate-dom, the UI library built for synstate, the bindings for React, Preact and Preact Signals, and how to connect synstate to any other framework.
---

## synstate-dom

[synstate-dom](/mono/synstate-dom/) is the UI library made for synstate. You pass observables straight into JSX, a component runs once, and each attribute, property and text you bound is a binding at the end of synstate's graph: it runs once every value of the update is up to date, once, with nothing diffed. Mounting is a batch, and a branch component (`If`, `Switch` and the like) decides which branches to drop before the values below it are recomputed, so no branch computes from a value that rules it out. There is no adapter in between: the graph you build with the operators on this site ends in the DOM.

## React, Preact and Preact Signals

`synstate-react-hooks`, `synstate-react-hooks-compat` and `synstate-preact-hooks` give a state as a hook and read any observable from a component ([React and Preact](/mono/synstate/integrations/react-and-preact/)), and `synstate-preact-signals` bridges observables and signals in both directions ([Preact Signals](/mono/synstate/integrations/preact-signals/)).

## Any other framework

What a framework needs is small: a way to be told that something changed, and a way to read the value. React's `useSyncExternalStore` takes exactly that:

```tsx
import {
    createState,
    map,
    type InitializedObservable,
    type Unsubscribe,
} from 'synstate';

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
- **Keep the logic in the graph.** Derive what a component shows with `map` and `derive` outside it, and give the component the result. The component then re-renders only when that result changes, and an update stops at the first value that does not change, so every update that would not change the result has already been dropped.
