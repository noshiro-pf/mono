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

// The store: module level, so it belongs to no scope and lives as long as the
// page.
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

export const Panel = (): JSX.Element => (
    <If
        cond={showStats$}
        then={<Stats />}
        else={<p>{constant('Stats are hidden')}</p>}
    />
);

const Stats = (): JSX.Element => {
    // Created only while the branch is shown, and disposed when it closes.
    const total$ = samples$.pipe(map(Arr.sum));

    return <p>{view(total$, (t) => `Total: ${t}`)}</p>;
};
```

That leaves one case: a heavy derivation defined globally and read only rarely. synstate-dom does not put such a derivation to sleep while nothing reads it. If that turns out to matter in a real application, it will be revisited.

## Event handlers

A handler runs outside every scope: by the time it is called, no `run` is executing. So an observable you create in a handler, such as `a$.pipe(map(...))`, belongs to no scope and keeps being computed even after its row or branch is gone. In development builds, synstate-dom warns when an observable is created inside a handler it registered.

Instead, have the handler write to a state, and derive from that state at mount time. If later work really has to create an observable, say after an `await`, grab the scope with `getCurrentScope()` while the component is mounting, and wrap the later work in that scope's `run`.

## Effects that last as long as the component

A component is called once, so what another library would run in an effect is started in the component's body and stopped when its scope is disposed. Three helpers do that:

- `subscribeInScope(source, next)` calls `next` with every value of `source`, the current one first, and unsubscribes when the scope is disposed.
- `listenInScope(target, type, listener, options)` adds an event listener to something other than an element the component draws, such as `window` or `document`, and removes it when the scope is disposed. For an element the component draws, use its `onClick`-style props.
- `createAfterUpdate()` returns a function that runs work in a microtask, after the update under way has finished. By then the DOM bound to that update has been written and the propagation is over, so the work may write to a state: a write made while another state is still propagating is what synstate warns of. It is also how work runs after the first mount, because a component's nodes are attached to the document only once the whole description they are in is mounted. Work for a scope disposed by then is dropped.

```tsx
import { createState } from 'synstate';
import {
    constant,
    createAfterUpdate,
    listenInScope,
    subscribeInScope,
    type JSX,
} from 'synstate-dom';

export const SearchBox = (): JSX.Element => {
    // Starts from the query saved last time.
    const [query$, setQuery] = createState(
        sessionStorage.getItem('search') ?? '',
    );

    // Saves the query whenever it changes, until the component's scope is
    // disposed: what an effect would do.
    subscribeInScope(query$, (query) => {
        sessionStorage.setItem('search', query);
    });

    // Removed with the scope, so a closed branch leaves no listener behind.
    listenInScope(globalThis, 'keydown', (event) => {
        if (event instanceof KeyboardEvent && event.key === 'Escape') {
            setQuery('');
        }
    });

    // The input is in the document only once the whole description is mounted, so
    // it is focused after that.
    const afterUpdate = createAfterUpdate();

    let mut_input: HTMLInputElement | undefined = undefined;

    afterUpdate(() => {
        mut_input?.focus();
    });

    return (
        <input
            placeholder={constant('Search')}
            ref={(element) => {
                mut_input = element;
            }}
            value={query$}
            onInput={(event) => {
                setQuery(event.currentTarget.value);
            }}
        />
    );
};
```
