## better-preact-use-state

A utility that improves Preact's `useState` to be safer and more convenient. Provides both `useState` (enhanced) and a dedicated `useBoolState` hook.

## Overview

Preact's `useState` can cause unintended behavior when you want to hold a function as a state. `better-preact-use-state` solves this problem and is a utility designed for safer state management. It is designed as a drop-in replacement for Preact's `useState` hook, with added functionality. `better-preact-use-state` also provides a simplified hook, `useBoolState`, specifically for boolean state.

## Installation

You can install it with any of the following:

```bash
npm install better-preact-use-state
```

```bash
yarn add better-preact-use-state
```

```bash
pnpm add better-preact-use-state
```

## Usage

### `useState`

`better-preact-use-state`'s `useState` can be used the same way as Preact's `useState`.

```tsx
import { useState } from 'better-preact-use-state';

const MyComponent: FunctionalComponent = () => {
    const [name, setName] = useState('John Doe');

    const [count, setCount, { updateState: updateCount }] = useState(0);

    const onNameChange = useCallback((event) => {
        setName(event.target.value);
    }, []);

    const incrementCount = useCallback(() => {
        updateCount((x) => x + 1);
    }, []);

    return (
        <div>
            <p>{`Count: ${count}`}</p>
            <button onClick={incrementCount}>{'Increment'}</button>

            <p>{`Name: ${name}`}</p>
            <input type='text' value={name} onChange={onNameChange} />
        </div>
    );
};
```

### `useBoolState`

`useBoolState` simplifies managing boolean state.

```tsx
import { useBoolState } from 'better-preact-use-state';

const MyComponent = () => {
    const [isOpen, { setTrue: open, setFalse: close, toggleState }] =
        useBoolState(false);

    return (
        <div>
            <p>{`Is Open: ${isOpen ? 'Yes' : 'No'}`}</p>
            <button onClick={open}>{'Open'}</button>
            <button onClick={close}>{'Close'}</button>
            <button onClick={toggleState}>{'Toggle'}</button>
            {/* Toggles the boolean value */}
        </div>
    );
};
```

## API Reference

### `useState`

```typescript
const [state, setState, { updateState, resetState }] = useState<T>(initialState: T);
```

-   `state`: The current state.
-   `setState`: Function to update the state.
-   `updateState`: Function to update the state based on the current state.
-   `resetState`: Function to reset the state to the initial value.

#### `updateState`

```typescript
updateState(updateFn: (v: T) => T): void;
```

Updates the state by passing a function `updateFn` that takes the current state as an argument and returns the new state.

#### `resetState`

```typescript
resetState(): void;
```

Resets the state to the initial value.

### `useBoolState`

```typescript
const [state, { setState, setTrue, setFalse, resetState, toggleState, updateState }] = useBoolState(initialState: boolean);
```

-   `state`: The current boolean value.
-   `setState`: Function to update the boolean value directly.
-   `setTrue`: Function to set the state to `true`.
-   `setFalse`: Function to set the state to `false`.
-   `resetState`: Function to reset the state to the initial value.
-   `toggleState`: Function to toggle the boolean value (true to false, false to true).
-   `updateState`: Function to update the state based on the current state.

#### `setState`

```typescript
setState(next: boolean): void;
```

Sets the state to the provided boolean value.

#### `setTrue`

```typescript
setTrue(): void;
```

Sets the state to `true`.

#### `setFalse`

```typescript
setFalse(): void;
```

Sets the state to `false`.

#### `resetState`

```typescript
resetState(): void;
```

Resets the state to the initial value.

#### `toggleState`

```typescript
toggleState(): void;
```

Toggles the current boolean value.

#### `updateState`

```typescript
updateState(updateFn: (v: boolean) => boolean): void;
```

Updates the state by passing a function `updateFn` that takes the current state as an argument and returns the new state. This is useful for updates that depend on the current state.

## Benefits of this library

With Preact's standard `useState`, attempting to store a function as state can lead to unexpected behavior (the function being interpreted as an updater function). `better-preact-use-state` solves this issue and, by providing `updateState`, allows functions to be safely held as state. Also, `resetState` lets you easily return the state to its initial value. `useBoolState` simplifies boolean state management in Preact, offering several advantages over directly using useState for booleans.

### Example Use Case

Useful when you want to hold a function as state.

```typescript
const [fn, setFn, { updateState: updateFn }] = useState(initialFn); // Holds a function as state

// In Preact's standard useState, `setFn(nextFn)` interprets nextFn as an update function.

// If you want to update the state with an update function, you can use updateState instead.
updateFn((currentFn) => nextFn);
```

## License

MIT
