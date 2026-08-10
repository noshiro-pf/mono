# SynState React hooks

synstate-react-hooks re-exports all exports from synstate except for `createState`, `createReducer`, and `createBooleanState`, and exports modified versions of those creation functions.

The first element of the array returned by the `createState<T>` function provided by synstate-preact-hooks is changed from `InitializedObservable<T>` to a React hook `() => T`, and the `InitializedObservable<T>` has been moved to the `state` property in the object at index 2.

## Installation

```bash
npm add synstate-react-hooks
```

Or with other package managers:

```bash
# Yarn
yarn add synstate-react-hooks

# pnpm
pnpm add synstate-react-hooks
```

## Quick Start

### Simple State Management

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

With `resetState`, `updateState`, `state` APIs:

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

## Subscribing to Observables: `useObservableValue`

Use `useObservableValue` to read any `Observable` — including derived ones produced by `pipe` / `combine` — from a React component. It is implemented on top of `useSyncExternalStore`, so the component re-renders whenever the source emits.

### Overloads

| Signature                                                           | Return type      | When to use                                                                                                                   |
| ------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `useObservableValue<A>(obs: InitializedObservable<A>)`              | `A`              | The observable always has a current value (e.g. came from `createState`, or a `pipe` chain that preserves the initial value). |
| `useObservableValue<A>(obs: Observable<A>)`                         | `A \| undefined` | The observable may not have emitted yet (no initial value).                                                                   |
| `useObservableValue<A, B = A>(obs: Observable<A>, initialValue: B)` | `A \| B`         | Provide a fallback used while the observable has no value. Implemented via `Optional.unwrapOr`.                               |

### Example

```tsx
import type * as React from 'react';
import { map, type Observable } from 'synstate';
import { createState, useObservableValue } from 'synstate-react-hooks';

const [useCount, setCount, { state: count$ }] = createState(0);

// Derived InitializedObservable — no fallback needed.
const doubled$ = count$.pipe(map((n) => n * 2));

// Imagine an Observable<string> that has no initial value
// (e.g. one waiting on an async source).
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
