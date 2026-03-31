---
title: React Integration
sidebar:
    order: 4
---

SynState provides a companion package `synstate-react-hooks` for seamless React integration.

## Installation

```bash
npm add synstate-react-hooks
```

## Basic Usage

`createState` from `synstate-react-hooks` returns a React hook instead of a raw Observable:

```tsx
import type * as React from 'react';
import { createState } from 'synstate-react-hooks';

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

This is equivalent to the following code without `synstate-react-hooks`:

```tsx
import * as React from 'react';
import { createState } from 'synstate';

const [userState, setUserState] = createState({
    name: '',
    email: '',
});

const UserProfile = (): React.JSX.Element => {
    const user = React.useSyncExternalStore(
        (onStoreChange: () => void) => {
            const { unsubscribe } = userState.subscribe(onStoreChange);

            return unsubscribe;
        },
        () => userState.getSnapshot().value,
    );

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

## Additional Utilities: Third Element

`synstate-react-hooks`'s `createState` also returns a 3-element tuple, just like the core package. The third element includes the same utilities (`updateState`, `resetState`, `getSnapshot`, `initialState`) described in [createState in Depth](/synstate/guides/core-state-management/), plus `state` — the underlying Observable:

```tsx
import type * as React from 'react';
import { createState } from 'synstate-react-hooks';

// The third element provides additional utilities and the underlying Observable.
const [
    useCount,
    setCount,
    {
        state,
        updateState: updateCount,
        resetState: resetCount,
        getSnapshot: getCountSnapshot,
    },
] = createState(0);

const increment = (): void => {
    updateCount((n) => n + 1);
};

const Counter = (): React.JSX.Element => {
    const count = useCount();

    return (
        <div>
            <p>{`Count: ${count}`}</p>
            <button onClick={increment}>{'Increment'}</button>
            <button onClick={resetCount}>{'Reset'}</button>
        </div>
    );
};

// `state` is the same InitializedObservable<number> that the core
// synstate package's createState returns as its first element.
// You can use it with pipe, combine, subscribe, etc.
state.subscribe((value) => {
    console.log('count changed:', value);
});

// Read the current value synchronously (outside of React rendering)
console.log('current count:', getCountSnapshot());
```

| Property       | Type                              | Description                                                                                                                                         |
| :------------- | :-------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| `state`        | `InitializedObservable<S>`        | The same Observable that the core `synstate` package's `createState` returns as its first element. Use it with `pipe`, `combine`, `subscribe`, etc. |
| `updateState`  | `(updateFn: (prev: S) => S) => S` | Update the state using a function of the previous value (see [createState in Depth](/synstate/guides/core-state-management/))                       |
| `resetState`   | `() => S`                         | Reset the state to its initial value                                                                                                                |
| `getSnapshot`  | `() => S`                         | Read the current value synchronously without subscribing                                                                                            |
| `initialState` | `S`                               | The initial value passed to `createState`                                                                                                           |

## Subscribing to Derived Observables: `useObservableValue`

The `state` property from the third element is a regular Observable that you can transform with `pipe`, `map`, `combine`, etc. To subscribe to a derived Observable in a React component, use `useObservableValue`:

```tsx
import type * as React from 'react';
import { map } from 'synstate';
import { createState, useObservableValue } from 'synstate-react-hooks';

const [useCount, , { state: count$ }] = createState(0);

// Derive a new Observable using pipe + map
const doubled$ = count$.pipe(map((n) => n * 2));

const message$ = count$.pipe(
    map((n) => (n === 0 ? 'Click to start' : `Count is ${n}`)),
);

const CountDisplay = (): React.JSX.Element => {
    const count = useCount(); // Equivalent to using useObservableValue(count$)

    // Subscribe to derived Observables with useObservableValue
    const doubled = useObservableValue(doubled$);

    const message = useObservableValue(message$);

    return (
        <div>
            <p>{`Count: ${count}, Doubled: ${doubled}`}</p>
            <p>{message}</p>
        </div>
    );
};
```

`useObservableValue` works with any `InitializedObservable` — whether it comes from `createState`, `pipe`, `combine`, or any other SynState operator. It subscribes to the Observable and returns the current value as React state, re-rendering the component when the value changes.

## React v17 or Earlier

If you're using React 16.8–17 (without `useSyncExternalStore`), install `synstate-react-hooks-compat`:

```bash
npm add synstate-react-hooks-compat
```

This package provides **the same API** as `synstate-react-hooks` but uses `useState` + `useEffect` internally. Just change the import:

```tsx
import { createState } from 'synstate-react-hooks-compat';

const [useUserState, setUserState] = createState({
    name: '',
    email: '',
});
```

All hooks (`createState`, `createReducer`, `createBooleanState`, `useObservableValue`, `useObservableEffect`) work identically. When you upgrade to React 18+, switch the import to `synstate-react-hooks` — no other code changes are needed.

:::note
`synstate-react-hooks` (React 18+) uses `useSyncExternalStore` for tear-free reads during concurrent rendering. The compat package cannot provide this guarantee, but works correctly for standard (non-concurrent) rendering.
:::

### Manual alternative (no extra package)

You can also use the core `synstate` package directly with `useState` and `useEffect`:

```tsx
import * as React from 'react';
import { createState } from 'synstate';

// Global state (outside component)
const [userState, setUserState, { getSnapshot }] = createState({
    name: '',
    email: '',
});

const UserProfile = (): React.JSX.Element => {
    const [user, setUser] = React.useState(getSnapshot());

    React.useEffect(() => {
        const subscription = userState.subscribe(setUser);

        return () => {
            subscription.unsubscribe();
        };
    }, []);

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
