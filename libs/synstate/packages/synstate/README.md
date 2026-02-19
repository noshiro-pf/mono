# SynState

<p align="center">
  <img src="./assets/synstate-icon.png" alt="SynState Logo" width="400" />
</p>

<p align="center">

[![npm version](https://img.shields.io/npm/v/synstate.svg)](https://www.npmjs.com/package/synstate)
[![npm downloads](https://img.shields.io/npm/dm/synstate.svg)](https://www.npmjs.com/package/synstate)
[![License](https://img.shields.io/npm/l/synstate.svg)](./LICENSE)
[![codecov](https://codecov.io/gh/noshiro-pf/synstate/graph/badge.svg?token=xrJgTVxMpr)](https://codecov.io/gh/noshiro-pf/synstate)

</p>

**SynState** is a lightweight, high-performance, type-safe state management library for TypeScript/JavaScript. Perfect for building reactive global state and event-driven systems in React, Vue, and other frameworks.

## Features

- 🎯 **Simple State Management**: Easy-to-use `createState` and `createReducer` for global state
- 📡 **Event System**: Built-in `createValueEmitter`, `createEventEmitter` for event-driven architecture
- 🔄 **Reactive Updates**: Automatic propagation of state changes to subscribers
- 🎨 **Type-Safe**: Full TypeScript support with precise type inference
- 🚀 **Lightweight**: Minimal bundle size with only one external runtime dependency ([ts-data-forge](https://www.npmjs.com/package/ts-data-forge))
- ⚡ **High Performance**: Optimized for fast state updates and minimal re-renders
- 🌐 **Framework Agnostic**: Works with React, Vue, Svelte, or vanilla JavaScript
- 🔧 **Flexible**: Simple state management with optional advanced Observable-based features (operators like `map`, `filter`, `debounceTime`, `throttleTime`, and combinators like `merge`, `combine`)

## Documentation

- API reference: TBD <!-- <https://noshiro-pf.github.io/synstate/> -->

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
const [state, setState, { updateState }] = createState(0);

const mut_history: number[] = [];

// Subscribe to changes (in React components, Vue watchers, etc.)
state.subscribe((count: number) => {
    mut_history.push(count);
});

assert.deepStrictEqual(mut_history, [0]);

// Update state
setState(1);

assert.deepStrictEqual(mut_history, [0, 1]);

updateState((prev: number) => prev + 1);

assert.deepStrictEqual(mut_history, [0, 1, 2]);
```

### With React

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

## Core Concepts

### State Management

SynState provides simple, intuitive APIs for managing application state:

- **`createState`**: Create mutable state with getter/setter
- **`createReducer`**: Redux-style state management
- **`createBooleanState`**: Specialized state for boolean values

### Event System

Built-in event emitter for event-driven patterns:

- **`createValueEmitter`**: Create type-safe event emitters
- **`createEventEmitter`**: Create event emitters without payload

### Observable (Optional Advanced Feature)

For advanced use cases, you can use observables to build complex reactive data flows. However, most applications will only need `createState`, `createReducer`, and `createValueEmitter`.

## API Reference

<!-- ### State Management (Recommended)

#### createState

Create reactive state with getter and setter.

#### createBooleanState

Specialized state for boolean values.

#### createReducer

Create state with reducer pattern (like Redux).

### Event System

#### createValueEmitter

Create type-safe event emitter with payload.

#### createEventEmitter

Create event emitter without payload.
-->

### Advanced Features (Optional)

For complex scenarios, SynState provides observable-based APIs:

#### Creation Functions

- `source<T>()`: Create a new observable source
- `of(value)`: Create observable from a single value
- `fromArray(array)`: Create observable from array
- `fromPromise(promise)`: Create observable from promise
- `interval(ms)`: Emit values at intervals
- `timer(delay)`: Emit after delay

#### Operators

- `filter(predicate)`: Filter values
- `map(fn)`: Transform values
- `scan(reducer, seed)`: Accumulate values
- `debounceTime(ms)`: Debounce emissions
- `throttleTime(ms)`: Throttle emissions
- `skipIfNoChange()`: Skip duplicate values
- `takeUntil(notifier)`: Complete on notifier emission

#### Combination

- `combine(observables)`: Combine latest values from multiple sources
- `merge(observables)`: Merge multiple streams
- `zip(observables)`: Pair values by index

## Examples

### Global Counter State (React)

```tsx
import * as React from 'react';
import { createState } from 'synstate';

// Create global state
export const [counterState, , { updateState, resetState, getSnapshot }] =
    createState(0);

// Component 1
const Counter = (): React.JSX.Element => {
    const [count, setCount] = React.useState(getSnapshot());

    React.useEffect(() => {
        const sub = counterState.subscribe(setCount);

        return () => {
            sub.unsubscribe();
        };
    }, []);

    return (
        <div>
            <p>
                {'Count: '}
                {count}
            </p>
            <button
                onClick={() => {
                    updateState((n: number) => n + 1);
                }}
            >
                {'Increment'}
            </button>
        </div>
    );
};

// Component 2 (synced automatically)
const ResetButton = (): React.JSX.Element => (
    <button
        onClick={() => {
            resetState();
        }}
    >
        {'Reset'}
    </button>
);
```

### Event-Driven Architecture (React)

```tsx
import * as React from 'react';
import { createEventEmitter, createValueEmitter } from 'synstate';

// Global events
export const [userLoggedIn$, emitUserLoggedIn] = createValueEmitter<
    Readonly<{
        id: number;
        name: string;
    }>
>();

export const [userLoggedOut$, emitUserLoggedOut] = createEventEmitter();

// Component that emits events
const LoginButton = (): React.JSX.Element => {
    const handleLogin = React.useCallback(() => {
        (async () => {
            const user = await loginUser();

            emitUserLoggedIn(user);
        })().catch(() => {});
    }, []);

    return <button onClick={handleLogin}>{'Login'}</button>;
};

// Component that listens to events
const NotificationPage = (): React.JSX.Element => {
    const [message, setMessage] = React.useState('');

    React.useEffect(() => {
        const sub1 = userLoggedIn$.subscribe((user) => {
            setMessage(`Welcome, ${user.name}!`);
        });

        const sub2 = userLoggedOut$.subscribe(() => {
            setMessage('Logged out');
        });

        return () => {
            sub1.unsubscribe();

            sub2.unsubscribe();
        };
    }, []);

    return message !== '' ? (
        <div className={'notification'}>{message}</div>
    ) : (
        <>{null}</>
    );
};

const loginUser = async (): Promise<
    Readonly<{
        id: number;
        name: string;
    }>
> => ({ id: 1, name: 'Alice' });
```

### Todo List with Reducer (React)

```tsx
import * as React from 'react';
import { createReducer } from 'synstate';

type Todo = Readonly<{ id: number; text: string; done: boolean }>;

type Action = Readonly<
    | { type: 'add'; text: string }
    | { type: 'toggle'; id: number }
    | { type: 'remove'; id: number }
>;

const [todoState, dispatch, getSnapshot] = createReducer<
    readonly Todo[],
    Action
>((todos, action) => {
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
}, []);

const TodoList = (): React.JSX.Element => {
    const [todos, setTodos] = React.useState(getSnapshot());

    React.useEffect(() => {
        const sub = todoState.subscribe(setTodos);

        return () => {
            sub.unsubscribe();
        };
    }, []);

    return (
        <div>
            {todos.map((todo) => (
                <div key={todo.id}>
                    <input
                        checked={todo.done}
                        type={'checkbox'}
                        onChange={() => {
                            dispatch({
                                type: 'toggle',
                                id: todo.id,
                            });
                        }}
                    />
                    <span>{todo.text}</span>
                </div>
            ))}
            <button
                onClick={() => {
                    dispatch({
                        type: 'add',
                        text: 'New Todo',
                    });
                }}
            >
                {'Add Todo'}
            </button>
        </div>
    );
};
```

### Boolean State (Dark Mode)

```tsx
import * as React from 'react';
import { createBooleanState } from 'synstate';

export const [darkModeState, { toggle, getSnapshot }] =
    createBooleanState(false);

const ThemeToggle = (): React.JSX.Element => {
    const [isDark, setIsDark] = React.useState(getSnapshot());

    React.useEffect(() => {
        const sub = darkModeState.subscribe(setIsDark);

        return () => {
            sub.unsubscribe();
        };
    }, []);

    React.useEffect(() => {
        document.body.className = isDark ? 'dark' : 'light';
    }, [isDark]);

    return (
        <button
            onClick={() => {
                toggle();
            }}
        >
            {isDark ? '🌙' : '☀️'}
        </button>
    );
};
```

### Cross-Component Communication

```tsx
import * as React from 'react';
import { createEventEmitter, createState, createValueEmitter } from 'synstate';

// Events
const [onItemAdded$, emitItemAdded] = createValueEmitter<string>();

const [onClearAll$, emitClearAll] = createEventEmitter();

// State
const [itemsState, setItemsState, { updateState, getSnapshot }] = createState<
    readonly string[]
>([]);

// Setup event handlers
onItemAdded$.subscribe((item) => {
    updateState((items: readonly string[]) => [...items, item]);
});

onClearAll$.subscribe(() => {
    setItemsState([]);
});

// Component 1: Add items
const ItemInput = (): React.JSX.Element => {
    const [input, setInput] = React.useState('');

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
                    emitItemAdded(input);

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
    const [items, setItems] = React.useState(getSnapshot());

    React.useEffect(() => {
        const sub = itemsState.subscribe(setItems);

        return () => {
            sub.unsubscribe();
        };
    }, []);

    return (
        <div>
            <ul>
                {items.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
            <button onClick={emitClearAll}>{'Clear All'}</button>
        </div>
    );
};
```

// Events

### Advanced: Search with Debounce

```tsx
import * as React from 'react';
import {
    createState,
    debounceTime,
    filter,
    fromPromise,
    type Observable,
    switchMap,
} from 'synstate';
import { Result } from 'ts-data-forge';

const [searchState, setSearchState] = createState('');

// Advanced reactive pipeline (optional feature)
const searchResults$: Observable<
    Result<readonly Readonly<{ id: string; name: string }>[], unknown>
> = searchState
    .pipe(debounceTime(300))
    .pipe(filter((query) => query.length > 2))
    .pipe(
        switchMap((query) =>
            fromPromise(
                fetch(`/api/search?q=${query}`).then(
                    (r) =>
                        r.json() as Promise<
                            readonly Readonly<{ id: string; name: string }>[]
                        >,
                ),
            ),
        ),
    );

const SearchBox = (): React.JSX.Element => {
    const [results, setResults] = React.useState<
        readonly Readonly<{ id: string; name: string }>[]
    >([]);

    React.useEffect(() => {
        const sub = searchResults$.subscribe((result) => {
            if (Result.isOk(result)) {
                setResults(result.value);
            }
        });

        return () => {
            sub.unsubscribe();
        };
    }, []);

    return (
        <div>
            <input
                placeholder={'Search...'}
                onChange={(e) => {
                    setSearchState(e.target.value);
                }}
            />
            <ul>
                {results.map((item) => (
                    <li key={item.id}>{item.name}</li>
                ))}
            </ul>
        </div>
    );
};
```

### Advanced: Event Emitter with Throttle

```tsx
import { createEventEmitter, throttleTime } from 'synstate';

// Create event emitter
const [refreshClicked, onRefreshClick] = createEventEmitter();

// Subscribe to events
refreshClicked.subscribe(() => {
    console.log('Refresh Clicked');
});

// Throttle refresh clicks to prevent rapid successive executions
const throttledRefresh = refreshClicked.pipe(throttleTime(2000));

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

## Why SynState?

### Simple State Management, Not Complex Reactive Programming

SynState is a state management library for web frontends, similar to Redux, Jotai, Zustand, and MobX. It provides APIs for creating and managing global state across your application.

Under the hood, SynState is built on Observable patterns similar to those provided by RxJS. However, unlike RxJS, which can make code harder to read with many operators and complex streams, SynState focuses on **simple, readable state management and event handling**. Most applications only need `createState`, `createReducer`, and `createValueEmitter` - clean, straightforward APIs that developers understand immediately.

**Advanced reactive features are optional** and only used when you actually need them (like debouncing search input). The library doesn't force you into a reactive programming mindset.

### Key Differences from RxJS

- **Focus on State & Events**: Designed for state management and event-driven architecture
- **Simpler API**: Most use cases covered by `createState`, `createReducer`, and `createValueEmitter`
- **Better Readability**: No need for complex operator chains in everyday code
- **Optional Complexity**: Advanced features available when needed

### Use Cases

**Use SynState when you need:**

- ✅ Global state management across components
- ✅ Event-driven communication between components
- ✅ Type-safe event emitters
- ✅ Redux-like state with reducers
- ✅ Simple reactive patterns (debounce, throttle, etc.)

**Consider other solutions when:**

- ❌ You need complex stream processing (use RxJS)
- ❌ Your app is simple enough for React Context alone

## Type Safety

SynState maintains full type information.

## License

This project is licensed under the [Apache License 2.0](./LICENSE).

## Repository

<https://github.com/noshiro-pf/synstate>
