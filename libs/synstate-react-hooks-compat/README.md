# SynState React hooks (compat)

synstate-react-hooks-compat re-exports all exports from synstate except for `createState`, `createReducer`, and `createBooleanState`, and exports modified versions of those creation functions.

The first element of the array returned by the `createState<T>` function provided by synstate-react-hooks-compat is changed from `InitializedObservable<T>` to a React hook `() => T`, and the `InitializedObservable<T>` has been moved to the `state` property in the object at index 2.

This package provides the same API as [synstate-react-hooks](https://www.npmjs.com/package/synstate-react-hooks), but subscribes to observables with `useState` + `useEffect` instead of `useSyncExternalStore`, so it also works with React 16.8 and 17. Use synstate-react-hooks if you are on React 18 or later.

## Installation

```bash
npm add synstate-react-hooks-compat
```

Or with other package managers:

```bash
# Yarn
yarn add synstate-react-hooks-compat

# pnpm
pnpm add synstate-react-hooks-compat
```

## Quick Start

### Simple State Management

```tsx
import type * as React from 'react';
import { createState } from 'synstate-react-hooks-compat';

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
import { createState } from 'synstate-react-hooks-compat';

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
