---
title: Lifecycle and scopes
description: Where scopes are created, what they dispose, and the two habits that keep derivations from running for a view that is not shown.
---

## Scopes

synstate-dom has no owner tree of its own; it uses synstate's own scopes. Any observable created synchronously while a scope runs belongs to that scope, and so does every subscription a binding makes. When the scope is disposed, all of them go with it.

A scope is created only where something can be disposed on its own:

| created by                                            | parent                         | disposed when                                    |
| :---------------------------------------------------- | :----------------------------- | :----------------------------------------------- |
| `render`                                              | none                           | the function `render` returned is called         |
| each branch of `If` / `MatchOptional` / `MatchResult` | the scope `If` was mounted in  | the branch changes, or the parent is disposed    |
| each row of `For`                                     | the scope `For` was mounted in | the row's key is gone, or the parent is disposed |

A component does not get a scope of its own: it is called once and lives exactly as long as the branch, row or root it is mounted in.

State you define at module level, outside every scope, belongs to no scope and lives as long as the page. That is where your application's stores go.

## Two habits

synstate derivations are not lazy. A derivation is recomputed whenever its parent changes, whether anything reads it or not. Two habits keep derivations from running for a view that is not on screen.

**If only one view reads a derivation, create it inside that component**, not next to the store. It then exists only while the component is mounted, and from the moment it is created it has a reader: the binding.

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

**Create what a branch shows inside the branch** (the `then` of `If`, the function you give `MatchOptional`), rather than creating both up front and then choosing between them.

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

That leaves one case: a heavy derivation defined globally and read only rarely. synstate-dom does not put such a derivation to sleep while nothing reads it. If that turns out to matter in a real application, it will be revisited.

## Event handlers

A handler runs outside every scope: by the time it is called, no `run` is executing. So an observable you create in a handler, such as `a$.pipe(map(...))`, belongs to no scope and keeps being computed even after its row or branch is gone. In development builds, synstate-dom warns when an observable is created inside a handler it registered.

Instead, have the handler write to a state, and derive from that state at mount time. If later work really has to create an observable, say after an `await`, grab the scope with `getCurrentScope()` while the component is mounting, and wrap the later work in that scope's `run`.
