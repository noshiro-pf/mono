**synstate-react-hooks**

***

# SynState React hooks

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
            <p>
                {'Name: '}
                {user.name}
            </p>
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
            <p>
                {'Name: '}
                {user.name}
            </p>
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

## Modules

- [create-boolean-state](create-boolean-state.md)
- [create-reducer](create-reducer.md)
- [create-state](create-state.md)
- [globals](globals.md)
- [synstate](synstate.md)
- [use-observable-effect](use-observable-effect.md)
- [use-observable-value](use-observable-value.md)
- [use-value-as-observable](use-value-as-observable.md)
