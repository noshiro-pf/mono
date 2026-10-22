---
title: Lifecycle and scopes
description: Where scopes are created, what they dispose, and the two habits that keep derivations from running for a view that is not shown.
---

## Scopes

synstate-dom has no owner tree of its own; it uses the scopes of synstate itself. An observable created synchronously while a scope is running belongs to that scope, and so does every subscription a binding makes. Disposing the scope disposes all of them.

Scopes are created only where something can be disposed on its own:

| created by                                            | parent                         | disposed when                                    |
| :---------------------------------------------------- | :----------------------------- | :----------------------------------------------- |
| `render`                                              | none                           | the function `render` returned is called         |
| each branch of `If` / `MatchOptional` / `MatchResult` | the scope `If` was mounted in  | the branch changes, or the parent is disposed    |
| each row of `For`                                     | the scope `For` was mounted in | the row's key is gone, or the parent is disposed |

A component does not get a scope of its own. It is called once, and it lives exactly as long as the branch, row or root it is mounted in.

State defined at module level, outside every scope, belongs to none and lives as long as the page. That is where the application's stores go.

## Two habits

synstate derivations are not lazy: a derivation is computed whenever its parent changes, whether anything reads it or not. Two habits keep a derivation from being computed for a view that is not shown.

**Create a derivation only one view reads inside that component**, not next to the store. It then exists only while the component is mounted, and it has a reader, the binding, from the moment it is created.

```tsx
import { createState, map } from 'synstate';
import { type JSX, view } from 'synstate-dom';
import { Arr } from 'ts-data-forge';

// The store: module level, so it belongs to no scope and lives as long as
// the page.
export const [cart$, setCart] = createState<readonly number[]>([]);

export const CartTotal = (): JSX.Element => {
    // Only this view reads the total, so it is created here. It belongs to the
    // scope this component is mounted in and is disposed with it.
    const total$ = cart$.pipe(map(Arr.sum));

    return <p>{view(total$, (t) => `Total: ${t}`)}</p>;
};
```

**Create what a branch shows inside the branch** (the `then` of `If`, the function given to `MatchOptional`), not before choosing between two of them.

```tsx
import { createBooleanState, createState, map } from 'synstate';
import { constant, If, view, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';

const [showStats$] = createBooleanState(false);

const [samples$] = createState<readonly number[]>([]);

const Stats = (): JSX.Element => {
    // Created only while the branch is shown, and disposed when it closes.
    const total$ = samples$.pipe(map(Arr.sum));

    return <p>{view(total$, (t) => `Total: ${t}`)}</p>;
};

export const Panel = (): JSX.Element => (
    <If
        cond={showStats$}
        then={<Stats />}
        else={<p>{constant('Stats are hidden')}</p>}
    />
);
```

What remains is a heavy derivation defined globally and read rarely. synstate-dom does not put such derivations to sleep while unread; if one turns out to matter in a real application, that will be reconsidered.

## Event handlers

A handler runs outside every scope: by the time it is called, no `run` is executing. An observable created in a handler, such as `a$.pipe(map(...))`, belongs to no scope and keeps being computed after its row or branch is gone. Development builds warn when an observable is created inside a handler synstate-dom registered.

Write to a state from a handler instead, and derive from that state at mount. Where later work really has to create an observable, after an `await` for instance, take the scope with `getCurrentScope()` while the component is being mounted, and wrap the later work in that scope's `run`.
