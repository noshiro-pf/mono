# SynState

<p align="center">
  <img src="./assets/synstate-logo.png" alt="SynState Logo" width="400" />
</p>

<p align="center">

[![npm version](https://img.shields.io/npm/v/synstate.svg)](https://www.npmjs.com/package/synstate)
[![npm downloads](https://img.shields.io/npm/dm/synstate.svg)](https://www.npmjs.com/package/synstate)
[![License](https://img.shields.io/npm/l/synstate.svg)](./LICENSE)
[![codecov](https://codecov.io/gh/noshiro-pf/synstate/graph/badge.svg)](https://codecov.io/gh/noshiro-pf/synstate)

</p>

**SynState** is a lightweight, high-performance, type-safe state management library for TypeScript/JavaScript applications. Perfect for building reactive global state and event-driven systems in React, Vue, and other frameworks.

"SynState" is named after "Synchronized + State." It represents a sound synchronized state through a **glitch-free**[^1] Observable implementation.

[^1]: See ["How SynState solved the glitch?"](./documents/how-synstate-solved-the-glitch.md).

## Features

- 🎯 **Simple State Management**: Easy-to-use `createState` and `createReducer` similar to React useState/useReducer for global state
- ⚡ **High Performance**: Optimized for fast state updates and minimal re-renders
- 🎨 **Type-Safe**: Full TypeScript support with precise type inference
- 🚀 **Lightweight**: <!-- bundle-size:synstate -->~4.5 kB min+gzip<!-- /bundle-size:synstate --> with only one external runtime dependency ([ts-data-forge](https://www.npmjs.com/package/ts-data-forge))
- 🌐 **Framework Agnostic**: Works with React, Vue, Svelte, or vanilla JavaScript
- 🔄 **Reactive Updates**: Automatic propagation of state changes to all subscribers
- 📡 **Event System**: Built-in `createValueEmitter`, `createEventEmitter` for event-driven architecture
- 🔧 **Observable-based**: Built on Observable pattern similar to RxJS, but with a completely independent implementation from scratch — not a wrapper. Offers optional advanced features like operators (`map`, `filter`, `scan`, `debounce`) and combinators (`merge`, `combine`)

## Documentation

- <https://noshiro-pf.github.io/synstate/>

## Installation

```bash
npm add synstate
```

Or with other package managers:

```bash
# Yarn
yarn add synstate

# pnpm
pnpm add synstate
```

## Quick Start

### Simple State Management

```tsx
// Create a reactive state
const [state, setState] = createState(0);
// type of state: InitializedObservable<number>
// type of setState: (v: number) => number

const stateHistory: number[] = [];

// Subscribe to changes
state.subscribe((count) => {
    stateHistory.push(count);
});

assert.deepStrictEqual(stateHistory, [0]);

// Update state
setState(1);

assert.deepStrictEqual(stateHistory, [0, 1]);
```

### With React

```bash
npm add synstate-react-hooks
```

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

This is equivalent to the following code without synstate-react-hook:

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

See also the [synstate-react-hooks README](../synstate-react-hooks/README.md).

If you're using React v17 or earlier:

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

## Why SynState?

### Simple to Start, Powerful When You Need It

SynState is a state management library for web frontends. For most use cases, `createState`, `createReducer`, and simple combinators like `combine` and `map` are all you need — clean, minimal APIs that feel as intuitive as React's `useState` / `useReducer`, but for global state.

When your requirements grow more complex, SynState scales with you. Built on its own Observable implementation, it provides operators like `debounce`, `throttle`, `switchMap`, and `mergeMap` for sophisticated asynchronous state management — without requiring an additional library like RxJS. You can describe everything from a simple counter to a debounced search pipeline with auto-cancellation in a single, unified API.

### Why Observable-Based?

A state management library that scales from simple global state to complex asynchronous workflows needs **reactive value propagation** at its core — when one piece of state changes, all derived values must update automatically and consistently. The Observable pattern is a natural fit for this: it models state as streams of values that can be composed, transformed, and combined declaratively.

RxJS is the most well-known Observable library, and it excels at modeling asynchronous event processing. However, RxJS has a fundamental issue known as **glitch**[^1] — a phenomenon where derived values can temporarily enter inconsistent intermediate states during synchronous propagation. For a state management library, where consistency of derived state is critical, this is unacceptable. SynState was built from scratch with a glitch-free Observable implementation to solve this problem.

For a detailed explanation, see ["How SynState solved the glitch?"](./documents/how-synstate-solved-the-glitch.md).

### Key Differences from RxJS

- **Glitch free**: While RxJS Observables suffer from a troublesome phenomenon called glitch [^1], SynState Observables are glitch-free.
- **InitializedObservable**: Provides `InitializedObservable` which always holds an initial value, making it ideal for representing state
- **Focus on State Management**: Designed specifically for state management, not just asynchronous event processing. SynState provides utility functions `createState`, `createReducer`, and `createBooleanState`. However, this doesn't mean it's inadequate for asynchronous event processing — it can handle asynchronous operations as elegantly as RxJS.

### Use Cases

**Use SynState when you need:**

- ✅ A small piece of global state shared across components (e.g., dark mode toggle, user session)
- ✅ Complex asynchronous state management with operators like `debounce`, `throttle`, `switchMap`
- ✅ Redux-like state with reducers (`createReducer`)
- ✅ A project where the scale of state management is uncertain — SynState's unified API covers everything from a single shared counter to a full debounced search pipeline, so you never have to switch libraries as requirements grow
- ✅ Type-safe event emitters (`createEventEmitter`)

**Consider other solutions when:**

- You only need a React component (local) state (use React hooks `useState`, `useReducer`)

## Examples

### Simple State with Additional APIs

```tsx
// Create a reactive state
const [
    state,
    setState,
    { updateState, resetState, getSnapshot, initialState },
] = createState(0);
// type of state: InitializedObservable<number>
// type of setState: (v: number) => number
// type of updateState: (updater: (prev: number) => number) => number
// type of resetState: () => void
// type of getSnapshot: () => number
// type of initialState: number

const stateHistory: number[] = [];

// Subscribe to changes
state.subscribe((count) => {
    stateHistory.push(count);
});

assert.deepStrictEqual(stateHistory, [0]);

assert.strictEqual(getSnapshot(), 0);

// Update state
setState(1);

assert.strictEqual(getSnapshot(), 1);

assert.deepStrictEqual(stateHistory, [0, 1]);

updateState((prev) => prev + 2);

assert.strictEqual(getSnapshot(), 3);

assert.deepStrictEqual(stateHistory, [0, 1, 3]);

resetState();

assert.strictEqual(getSnapshot(), 0);

assert.strictEqual(initialState, 0);

assert.deepStrictEqual(stateHistory, [0, 1, 3, 0]);
```

### Global Counter State (React)

```tsx
import type * as React from 'react';
import { createState } from 'synstate-react-hooks';

// Create global state
export const [useCounterState, , { updateState, resetState }] = createState(0);

const increment = (): void => {
    updateState((n) => n + 1);
};

// Component 1
const Counter = (): React.JSX.Element => {
    const count = useCounterState();

    return (
        <div>
            <p>{`Count: ${count}`}</p>
            <button onClick={increment}>{'Increment'}</button>
        </div>
    );
};

// Component 2
const ResetButton = (): React.JSX.Element => (
    <button onClick={resetState}>{'Reset'}</button>
);
```

### Todo List with Reducer (React)

```tsx
import * as React from 'react';
import { createReducer } from 'synstate-react-hooks';

type Todo = Readonly<{
    id: number;
    text: string;
    done: boolean;
}>;

type Action = Readonly<
    | { type: 'add'; text: string }
    | { type: 'toggle'; id: number }
    | { type: 'remove'; id: number }
>;

const initialTodos: readonly Todo[] = [] as const;

const reducer = (todos: readonly Todo[], action: Action): readonly Todo[] => {
    switch (action.type) {
        case 'add':
            return [
                ...todos,
                {
                    id: Date.now(),
                    text: action.text,
                    done: false,
                },
            ];

        case 'toggle':
            return todos.map((t) =>
                t.id === action.id ? { ...t, done: !t.done } : t,
            );

        case 'remove':
            return todos.filter((t) => t.id !== action.id);
    }
};

const [useTodoState, dispatch] = createReducer<readonly Todo[], Action>(
    reducer,
    initialTodos,
);

const addTodo = (): void => {
    dispatch({
        type: 'add',
        text: 'New Todo',
    });
};

const TodoList = (): React.JSX.Element => {
    const todos = useTodoState();

    const todosWithHandler = React.useMemo(
        () =>
            todos.map((todo) => ({
                ...todo,
                onToggle: () => {
                    dispatch({
                        type: 'toggle',
                        id: todo.id,
                    });
                },
                onRemove: () => {
                    dispatch({
                        type: 'remove',
                        id: todo.id,
                    });
                },
            })),
        [todos],
    );

    return (
        <div>
            {todosWithHandler.map((todo) => (
                <div key={todo.id}>
                    <input
                        checked={todo.done}
                        type={'checkbox'}
                        onChange={todo.onToggle}
                    />
                    <span>{todo.text}</span>
                    <button onClick={todo.onRemove}>{'Remove'}</button>
                </div>
            ))}
            <button onClick={addTodo}>{'Add Todo'}</button>
        </div>
    );
};
```

### Boolean State (Dark Mode)

```tsx
import * as React from 'react';
import { createBooleanState } from 'synstate-react-hooks';

export const [useDarkModeState, { toggle: toggleDarkMode }] =
    createBooleanState(false);

const ThemeToggle = (): React.JSX.Element => {
    const isDark = useDarkModeState();

    React.useEffect(() => {
        document.body.className = isDark ? 'dark' : 'light';
    }, [isDark]);

    return <button onClick={toggleDarkMode}>{isDark ? '🌙' : '☀️'}</button>;
};
```

### Cross-Component Communication

```tsx
import * as React from 'react';
import { createState } from 'synstate-react-hooks';

// State
const [useItemsState, _, { updateState, resetState: resetItemsState }] =
    createState<readonly string[]>([]);

// Setup event handlers
const addItem = (item: string): void => {
    updateState((items: readonly string[]) => [...items, item]);
};

// Component 1: Add items
const ItemInput = (): React.JSX.Element => {
    const [input, setInput] = React.useState<string>('');

    return (
        <div>
            <input
                value={input}
                onChange={(e) => {
                    setInput(e.target.value);
                }}
            />
            <button
                onClick={() => {
                    addItem(input);

                    setInput('');
                }}
            >
                {'Add'}
            </button>
        </div>
    );
};

// Component 2: Display items
const ItemList = (): React.JSX.Element => {
    const items = useItemsState();

    return (
        <div>
            <ul>
                {items.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
            <button onClick={resetItemsState}>{'Clear All'}</button>
        </div>
    );
};
```

### Advanced: Search with Debounce

```tsx
import type * as React from 'react';
import {
    createState,
    debounce,
    filter,
    fromAbortablePromise,
    type InitializedObservable,
    map,
    switchMap,
    withInitialValue,
} from 'synstate';
import { useObservableValue } from 'synstate-react-hooks';
import { Result } from 'ts-data-forge';

const [searchState, setSearchState] = createState('');

// Advanced reactive pipeline with debounce and filtering
const searchResults$: InitializedObservable<
    readonly Readonly<{ id: string; name: string }>[]
> = searchState
    .pipe(debounce(300))
    .pipe(filter((query) => query.length > 2))
    .pipe(
        switchMap((query) =>
            fromAbortablePromise((signal) =>
                fetch(`/api/search?q=${query}`, { signal }).then(
                    (r) =>
                        r.json() as Promise<
                            readonly Readonly<{ id: string; name: string }>[]
                        >,
                ),
            ),
        ),
    )
    .pipe(filter((res) => Result.isOk(res)))
    .pipe(map((res) => Result.unwrapOk(res)))
    .pipe(withInitialValue([]));

const SearchBox = (): React.JSX.Element => {
    const searchResults = useObservableValue(searchResults$);

    return (
        <div>
            <input
                placeholder={'Search...'}
                onChange={(e) => {
                    setSearchState(e.target.value);
                }}
            />
            <ul>
                {searchResults.map((item) => (
                    <li key={item.id}>{item.name}</li>
                ))}
            </ul>
        </div>
    );
};
```

### Advanced: Event Emitter with Throttle

```tsx
import { createEventEmitter, throttle } from 'synstate';

// Create event emitter
const [refreshClicked, onRefreshClick] = createEventEmitter();
// refreshClicked: Observable<void>
// onRefreshClick: () => void

// Subscribe to events
refreshClicked.subscribe(() => {
    console.log('Refresh Clicked');
});

// Throttle refresh clicks to prevent rapid successive executions
const throttledRefresh = refreshClicked.pipe(throttle(2000));

throttledRefresh.subscribe(() => {
    console.log('Executing refresh...');
    // Actual refresh logic here
    // This will be called at most once every 2 seconds
});

const DataTable = (): React.JSX.Element => (
    <div>
        <button onClick={onRefreshClick}>{'Refresh'}</button>
        <p>
            {'Data: '}
            {/* Display data here */}
        </p>
    </div>
);
```

## API Reference

### State Management

SynState provides simple, intuitive APIs for managing application state:

- **`createState`**: Create state with InitializedObservable and setter
- **`createReducer`**: Create state by reducer and initial value
- **`createBooleanState`**: Specialized state for boolean values

### Event System

Built-in event emitter for event-driven patterns:

- **`createValueEmitter`**: Create type-safe event emitters
- **`createEventEmitter`**: Create event emitters without payload

### Observable APIs

For complex scenarios, SynState provides observable-based APIs:

#### Creation Functions

- `source<T>()`: Create a new observable source (Almost equivalent to RxJS `subject`)
- `fromPromise(promise)`: Create observable from promise
- `fromSubscribable()`: Create observable from any subscribable object
- `counter(ms)`: Emit values at intervals (Almost equivalent to RxJS `interval`)
- `timer(delay)`: Emit after delay

#### Operators

- `map` variants
    - `map(fn)`: Transform values
    - `mapTo(value)`: Map all values to a constant
    - `getKey(key)`: Extract property value from objects (alias: `pluck`)
    - `attachIndex()`: Attach index to each value (alias: `withIndex`)
    - Result/Optional
        - `mapOptional(fn)`: Map over Optional values
        - `mapResultOk(fn)`: Map over Result ok values
        - `mapResultErr(fn)`: Map over Result error values
        - `unwrapOptional()`: Unwrap Optional values to undefined
        - `unwrapResultOk()`: Unwrap Result ok values to undefined
        - `unwrapResultErr()`: Unwrap Result error values to undefined
    - `mergeMap(fn)`: Map to observables and merge all (runs in parallel) (alias: `flatMap`)
    - `switchMap(fn)`: Map to observables and switch to latest (cancels previous)
- Filtering
    - `filter(predicate)`: Filter values
    - `skipIfNoChange()`: Skip duplicate values (alias: `distinctUntilChanged`)
    - `skip(n)`: Skip first n emissions
    - `take(n)`: Take first n emissions then complete
    - `skipWhile(predicate)`: Skip values while predicate is true
    - `takeWhile(predicate)`: Emit values while predicate is true, then complete
    - `skipUntil(notifier)`: Skip values until notifier emits
    - `takeUntil(notifier)`: Complete on notifier emission
- Time series processing
    - `audit(ms)`: Emit the last value after specified time window (Almost equivalent to RxJS `auditTime`)
    - `debounce(ms)`: Debounce emissions (Almost equivalent to RxJS `debounceTime`)
    - `throttle(ms)`: Throttle emissions (Almost equivalent to RxJS `throttleTime`)
- Others
    - `pairwise()`: Emit previous and current values as pairs
    - `scan(reducer, seed)`: Accumulate values
    - `withBuffered(observable)`: Buffer values from observable and emit with parent (alias: `withBufferedFrom`)
    - `withCurrentValueFrom(observable)`: Sample current value from another observable (alias: `withLatestFrom`)
    - `withInitialValue(value)`: Provide an initial value for uninitialized observable

#### Combination

- `combine(observables)`: Combine latest values from multiple sources (alias: `combineLatest`)
- `merge(observables)`: Merge multiple streams
- `zip(observables)`: Pair values by index

#### Utilities

- `isChildObservable(obs)`: Check if observable is a child observable
- `isManagerObservable(obs)`: Check if observable is a manager observable
- `isRootObservable(obs)`: Check if observable is a root observable

## Type Safety

SynState maintains full type information.

## License

This project is licensed under the [Apache License 2.0](./LICENSE).

## Repository

<https://github.com/noshiro-pf/synstate>
