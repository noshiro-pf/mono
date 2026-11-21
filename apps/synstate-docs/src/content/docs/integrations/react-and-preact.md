---
title: React and Preact
description: synstate-react-hooks and synstate-preact-hooks, which give a state as a hook and read any observable from a component.
---

synstate is not tied to a UI library, and three packages connect it to React and Preact:

- **`synstate-react-hooks`** for React 18 and later.
- **`synstate-react-hooks-compat`** for React 16.8 and 17. It has the same API and reads observables through `use-sync-external-store/shim`.
- **`synstate-preact-hooks`** for Preact.

Each re-exports everything synstate exports except `createState`, `createReducer` and `createBooleanState`, which it replaces with versions that return a hook. Import from the hooks package alone, and a component and the rest of the application see the same graph.

```sh
npm install synstate synstate-react-hooks # React 18 or later
npm install synstate synstate-react-hooks-compat # React 16.8 or 17
npm install synstate synstate-preact-hooks # Preact
```

## A state as a hook

`createState` returns a hook in place of the observable, and the setter beside it. The state can be created at the top level of a module and shared by every component that calls the hook: there is no provider.

```tsx
import type * as React from 'react';
import { createState } from 'synstate-react-hooks';

// Global state (outside component)
const [useUserState, setUserState] = createState({
    name: '',
    email: '',
});

const UserProfile = (): React.JSX.Element => {
    const user = useUserState();

    return (
        <div>
            <p>{`Name: ${user.name}`}</p>
            <button
                onClick={() => {
                    setUserState({
                        name: 'Alice',
                        email: 'alice@example.com',
                    });
                }}
            >
                {'Set User'}
            </button>
        </div>
    );
};
```

The observable itself is the `state` property of the third element, with `updateState`, `resetState` and `getSnapshot`, for the code outside components that derives from it or writes to it:

```tsx
import type * as React from 'react';
import { createState } from 'synstate-react-hooks';

// Global state (outside component)
const [
    useUserState,
    setUserState,
    {
        resetState: resetUserState,
        updateState: updateUserState,
        state: userState,
    },
] = createState({
    name: '',
    email: '',
});

userState.subscribe((u) => {
    console.log('User is updated:', u);
});

const UserProfile = (): React.JSX.Element => {
    const user = useUserState();

    return (
        <div>
            <p>{`Name: ${user.name}`}</p>
            <button
                onClick={() => {
                    setUserState({
                        name: 'Alice',
                        email: 'alice@example.com',
                    });
                }}
            >
                {'Set User'}
            </button>
            <button
                onClick={() => {
                    updateUserState((prev) => ({
                        name: prev.name,
                        email: '',
                    }));
                }}
            >
                {'Reset email'}
            </button>
            <button onClick={resetUserState}>{'Reset'}</button>
        </div>
    );
};
```

## Reading any observable

`useObservableValue` reads any observable, a derived one included, built on `useSyncExternalStore`. The component renders again when the observable's value changes, and reads `undefined`, or the fallback it is given, while the observable holds none:

```tsx
import type * as React from 'react';
import { map, type Observable } from 'synstate';
import { createState, useObservableValue } from 'synstate-react-hooks';

const [useCount, setCount, { state: count$ }] = createState(0);

// Derived InitializedObservable — no fallback needed.
const doubled$ = count$.pipe(map((n) => n * 2));

// Imagine an Observable<string> that has no initial value (e.g. one waiting on
// an async source).
declare const userName$: Observable<string>;

const Profile = (): React.JSX.Element => {
    const doubled = useObservableValue(doubled$); // number

    const userName = useObservableValue(userName$, 'Guest'); // string

    return (
        <div>
            <p>{`Doubled count: ${doubled}`}</p>
            <p>{`Hello, ${userName}`}</p>
        </div>
    );
};
```

It works in server rendering too, since the current value of a synstate observable can be read synchronously. A store created at the top level of a module is one store per server process, shared by every request it renders: keep per-request data out of such stores, and create a store per request instead, passed down through a context.

Two more hooks complete the set. `useObservableEffect(observable, fn)` calls `fn` with each value while the component is mounted, without rendering again. `useValueAsObservable(value)` turns a prop into an observable that operators can follow, which is disposed when the component unmounts.

## Preact

`synstate-preact-hooks` has the same API on Preact:

```tsx
import type * as Preact from 'preact';
import { createState } from 'synstate-preact-hooks';

// Global state (outside component)
const [useUserState, setUserState] = createState({
    name: '',
    email: '',
});

const UserProfile = (): Preact.JSX.Element => {
    const user = useUserState();

    return (
        <div>
            <p>{`Name: ${user.name}`}</p>
            <button
                onClick={() => {
                    setUserState({
                        name: 'Alice',
                        email: 'alice@example.com',
                    });
                }}
            >
                {'Set User'}
            </button>
        </div>
    );
};
```

To update only the DOM nodes that show a value, without rendering the component again, bridge synstate to Preact Signals instead: [Preact Signals](/mono/synstate/integrations/preact-signals/).
