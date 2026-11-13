---
title: Lifecycle and owners
description: Where owners are created, what they dispose, and the two habits that keep derivations from running for a view that is not shown.
---

## Owners

synstate-dom-next has no lifetime of its own: it uses synstate-next's owners, which are the only lifetime there is. Everything created while an owner's `run` executes belongs to that owner: the observables, the bindings, the subscriptions, the cleanups registered with `onCleanup`, and the owners created inside it. Disposing an owner disposes its child owners, then runs its cleanups, then disposes its nodes, each newest first. Nothing is reference-counted, and nothing travels down the graph to say that a source has ended: what depends on something goes when its owner goes.

An owner is created only where something can be disposed on its own:

| created by                                                       | parent                                        | disposed when                                    |
| :--------------------------------------------------------------- | :-------------------------------------------- | :----------------------------------------------- |
| `render`                                                         | none                                          | the function `render` returned is called         |
| each branch of `If` / `MatchOptional` / `MatchResult` / `Switch` | the owner the branch component was mounted in | the branch changes, or the parent is disposed    |
| each row of `For`                                                | the owner `For` was mounted in                | the row's key is gone, or the parent is disposed |
| each call of `mountChild`                                        | the owner current at the call                 | the parent is disposed, or the child throws      |

A component does not get an owner of its own: it is called once and lives exactly as long as the branch, row or root it is mounted in.

State you define at module level, outside every owner, belongs to none and lives as long as the page. That is where your application's stores go.

A branch's owner is made a little differently from a plain `createOwner()`: every node created in it sits deeper in the graph than the node that decides the branch. That is what lets a branch component decide, in the update, before any node of the branch is visited ([How it works](/mono/synstate-dom-next/background/how-it-works/#a-branch-component-decides-before-its-branch-computes)).

## Two habits

synstate-next's derivations are not lazy. A derivation is recomputed whenever its parent changes, whether anything reads it or not (though a result equal to the last one goes no further). Two habits keep derivations from running for a view that is not on screen.

**If only one view reads a derivation, create it inside that component**, not next to the store. It then exists only while the component is mounted, and from the moment it is created it has a reader: the binding.

```tsx
import type { JSX } from 'synstate-dom-next';
import { createState, map } from 'synstate-next';
import { Arr } from 'ts-data-forge';

// The store: module level, so it belongs to no owner and lives as long as the
// page.
export const [cart$, setCart] = createState<readonly number[]>([]);

export const CartTotal = (): JSX.Element => {
    // Only this view reads the total, so it is created here. It belongs to the
    // owner this component is mounted in and is disposed with it.
    const total$ = cart$.pipe(map(Arr.sum));

    return <p>{total$.pipe(map((t) => `Total: ${t}`))}</p>;
};
```

**Create what a branch shows inside the branch**, in a component the `then` of `If` mounts or in the function you give `MatchOptional`, rather than creating both up front and then choosing between them.

```tsx
import { constant, If, type JSX } from 'synstate-dom-next';
import { createBooleanState, createState, map } from 'synstate-next';
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

    return <p>{total$.pipe(map((t) => `Total: ${t}`))}</p>;
};
```

"Inside the branch" means inside a component the branch mounts, as `Stats` above. JSX written straight into `then` is evaluated where it is written, before `If` chooses, so a `pipe(map(...))` in it is created in the enclosing component's owner and keeps computing while the branch is hidden. That is fine for a few light bindings; move a branch with many bindings, or ones that update often, into a component of its own.

That leaves one case: a heavy derivation defined globally and read only rarely. Nothing puts such a derivation to sleep while nothing reads it.

## Event handlers and `await`

An owner is current only while its `run` executes. An event handler, a timer callback, the function given to `subscribe`, and every recompute run with no owner current, so that what they create does not belong to whichever owner happened to be current when a write was made. An observable you create in a handler, such as `a$.pipe(map(...))`, therefore belongs to no owner and keeps being computed after its row or branch is gone, and a `subscribe` made there is never unsubscribed. Nothing warns of it at run time. (eslint-plugin-synstate's `no-observable-in-handler` reports this for synstate; it does not know synstate-next's package name yet.)

Instead, have the handler write to a state, and derive from that state at mount time. A write needs no owner. If later work really has to create something that should go with the component, take the owner with `getOwner()` while the component mounts and wrap that work in its `run`. In an owner already disposed, `run` still calls the function, with no owner current, so check `disposed` first:

```tsx
import type { JSX } from 'synstate-dom-next';
import { createState, getOwner, map } from 'synstate-next';

type Profile = Readonly<{ name: string }>;

declare const fetchProfile: () => Promise<Profile>;

export const Greeting = (): JSX.Element => {
    const [name$, setName] = createState('');

    // Taken while the component mounts: the owner it is mounted in.
    const owner = getOwner();

    const load = async (): Promise<void> => {
        const profile = await fetchProfile();

        // After the `await`, no owner is current. A write needs none; something
        // made here that should go with the component is made in its owner, unless
        // the component was unmounted while the fetch was pending.
        setName(profile.name);

        if (owner === undefined || owner.disposed) {
            return;
        }

        owner.run(() => {
            name$.subscribe((name) => {
                console.info(`greeting ${name}`);
            });
        });
    };

    load().catch((error: unknown) => {
        console.error(error);
    });

    return <p>{name$.pipe(map((name) => `Hello, ${name}`))}</p>;
};
```

The same holds after an `await` inside a component: the component runs in its owner only until it returns, so in an `async` function it starts, what comes after the first `await` runs with no owner.

## Effects that last as long as the component

A component is called once, so what another library would run in an effect is started in the component's body and stopped when its owner is disposed.

- `source.subscribe(next)` calls `next` at once with the current value, and then once after each update that changed it, once every value of the update is up to date. Made while the component mounts, it belongs to the component's owner, which unsubscribes it when disposed. To keep a subscription past the owner, make it inside `untracked`. A write made by `next` starts the next update, after the current one; it never interrupts it.
- `onCleanup(fn)` runs `fn` when the current owner is disposed.
- `listenInScope(target, type, listener, options)` adds an event listener to something other than an element the component draws, such as `window` or `document`, and removes it when the owner is disposed. For an element the component draws, use its `onClick`-style props.
- `createAfterUpdate()` returns a function that runs work in a microtask, after the update under way and the DOM changes it makes, unless the owner has been disposed by then. A component's nodes are attached to the document only once the whole description they are in is mounted, so this is how work that needs them in the document (focusing an input, measuring an element) runs after the first mount.

```tsx
import {
    constant,
    createAfterUpdate,
    isImeKeyDown,
    listenInScope,
    type JSX,
} from 'synstate-dom-next';
import { createState } from 'synstate-next';

export const SearchBox = (): JSX.Element => {
    // Starts from the query saved last time.
    const [query$, setQuery] = createState(
        sessionStorage.getItem('search') ?? '',
    );

    // Saves the query whenever it changes. Subscribed while the component mounts,
    // so it belongs to the component's owner, which unsubscribes it: what an
    // effect would do.
    query$.subscribe((query) => {
        sessionStorage.setItem('search', query);
    });

    // Removed with the owner, so a closed branch leaves no listener behind.
    listenInScope(globalThis, 'keydown', (event) => {
        if (
            event instanceof KeyboardEvent &&
            event.key === 'Escape' &&
            !isImeKeyDown(event)
        ) {
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
