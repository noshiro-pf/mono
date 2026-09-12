# better-react-use-state

A utility that improves React's `useState` to be safer and more convenient. Provides both `useState` (enhanced) and a dedicated `useBoolState` hook.

## Overview

React's `useState` hands back a single setter that accepts either the next value or an updater function, so the two cannot be told apart by type. `better-react-use-state` is a utility designed for safer state management: its `setState` accepts only the next value, and it also hands back `updateState` and `resetState`. It is designed as a drop-in replacement for React's `useState` hook, with added functionality. `better-react-use-state` also provides a simplified hook, `useBoolState`, specifically for boolean state.

## Installation

You can install it with any of the following:

```bash
npm install better-react-use-state
```

```bash
yarn add better-react-use-state
```

```bash
pnpm add better-react-use-state
```

## Usage

### `useState`

`better-react-use-state`'s `useState` can be used the same way as React's `useState`.

```tsx
import { useState } from 'better-react-use-state';
import * as React from 'react';

export const MyComponent = (): React.JSX.Element => {
    const [userName, setUserName] = useState('John Doe');

    const [count, , { updateState: updateCount }] = useState(0);

    const onNameChange: React.ChangeEventHandler<HTMLInputElement> =
        React.useCallback(
            (ev) => {
                setUserName(ev.target.value);
            },
            [setUserName],
        );

    const incrementCount = React.useCallback(() => {
        updateCount((x) => x + 1);
    }, [updateCount]);

    return (
        <div>
            <p>{`Count: ${count}`}</p>
            <button type={'button'} onClick={incrementCount}>
                {'Increment'}
            </button>

            <p>{`Name: ${userName}`}</p>
            <input type={'text'} value={userName} onChange={onNameChange} />
        </div>
    );
};
```

### `useBoolState`

`useBoolState` simplifies managing boolean state.

```tsx
import { useBoolState } from 'better-react-use-state';
import type * as React from 'react';

export const MyComponent = (): React.JSX.Element => {
    const [isOpen, { setTrue: openPanel, setFalse: closePanel, toggleState }] =
        useBoolState(false);

    return (
        <div>
            <p>{`Is Open: ${isOpen ? 'Yes' : 'No'}`}</p>
            <button type={'button'} onClick={openPanel}>
                {'Open'}
            </button>
            <button type={'button'} onClick={closePanel}>
                {'Close'}
            </button>
            {/* Toggles the boolean value */}
            <button type={'button'} onClick={toggleState}>
                {'Toggle'}
            </button>
        </div>
    );
};
```

## API Reference

### `useState`

```ts
const [state, setState, { updateState, resetState }] = useState(initialState);
```

- `state`: The current state.
- `setState`: Function to update the state.
- `updateState`: Function to update the state based on the current state.
- `resetState`: Function to reset the state to the initial value.

#### `updateState`

```ts
updateState: (updateFn: (v: T) => T) => void;
```

Updates the state by passing a function `updateFn` that takes the current state as an argument and returns the new state.

#### `resetState`

```ts
resetState: () => void;
```

Resets the state to the initial value.

### `useBoolState`

```ts
const [
    state,
    { setState, setTrue, setFalse, resetState, toggleState, updateState },
] = useBoolState(initialState);
```

- `state`: The current boolean value.
- `setState`: Function to update the boolean value directly.
- `setTrue`: Function to set the state to `true`.
- `setFalse`: Function to set the state to `false`.
- `resetState`: Function to reset the state to the initial value.
- `toggleState`: Function to toggle the boolean value (true to false, false to true).
- `updateState`: Function to update the state based on the current state.

#### `setState`

```ts
setState: (next: boolean) => void;
```

Sets the state to the provided boolean value.

#### `setTrue`

```ts
setTrue: () => void;
```

Sets the state to `true`.

#### `setFalse`

```ts
setFalse: () => void;
```

Sets the state to `false`.

#### `resetState`

```ts
resetState: () => void;
```

Resets the state to the initial value.

#### `toggleState`

```ts
toggleState: () => void;
```

Toggles the current boolean value.

#### `updateState`

```ts
updateState: (updateFn: (v: boolean) => boolean) => void;
```

Updates the state by passing a function `updateFn` that takes the current state as an argument and returns the new state. This is useful for updates that depend on the current state.

## Benefits of this library

With React's standard `useState`, `setState` accepts either the next value or an updater function, and nothing in the types tells the two apart. `better-react-use-state` separates them: `setState` is typed to accept only the next value, and an update that depends on the current value goes through `updateState` explicitly. `resetState` lets you easily return the state to its initial value. `useBoolState` simplifies boolean state management in React, offering several advantages over directly using `useState` for booleans.

### Holding a function as state

The initial value and the argument of `setState` are passed to React's `useState` as they are, so a function given to either is still called as a lazy initializer or an updater, just as with React's own hook. To hold a function as state, wrap it in an object:

```ts
const [{ fn }, setFn] = useState({ fn: initialFn });

const onReplace = (): void => {
    setFn({ fn: nextFn });
};
```

## License

Apache-2.0
