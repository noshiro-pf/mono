**syncflow**

***

# SyncFlow

[![npm version](https://img.shields.io/npm/v/ts-data-forge.svg)](https://www.npmjs.com/package/ts-data-forge)
[![npm downloads](https://img.shields.io/npm/dm/ts-data-forge.svg)](https://www.npmjs.com/package/ts-data-forge)
[![License](https://img.shields.io/npm/l/ts-data-forge.svg)](./LICENSE)
[![codecov](https://codecov.io/gh/noshiro-pf/ts-data-forge/branch/main/graph/badge.svg?token=69TA40HACZ)](https://codecov.io/gh/noshiro-pf/ts-data-forge)

**SyncFlow** is a lightweight, type-safe state management library for TypeScript/JavaScript. Perfect for building reactive global state and event-driven systems in React, Vue, and other frameworks.

## Features

- 🎯 **Simple State Management**: Easy-to-use `createState` and `createReducer` for global state
- 📡 **Event System**: Built-in `createValueEmitter`, `createEventEmitter` for event-driven architecture
- 🔄 **Reactive Updates**: Automatic propagation of state changes to subscribers
- 🎨 **Type-Safe**: Full TypeScript support with precise type inference
- 🚀 **Lightweight**: Minimal bundle size, zero external runtime dependencies
- ⚡ **Framework Agnostic**: Works with React, Vue, Svelte, or vanilla JavaScript
- 🔧 **Flexible**: Simple state management with optional advanced features

## Documentation

- API reference: <https://noshiro-pf.github.io/syncflow/>

## Installation

```bash
npm add syncflow
```

Or with other package managers:

```bash
# Yarn
yarn add syncflow

# pnpm
pnpm add syncflow
```

## Quick Start

### Simple State Management

```tsx
import { createState } from 'syncflow';

// Create a reactive state
const [state, setState, { updateState }] = createState(0);

// Subscribe to changes (in React components, Vue watchers, etc.)
state.subscribe((count: number) => {
    console.log('Count:', count);
});

// Update state
setState(1);

updateState((prev: number) => prev + 1);
```

### Event Emitter

```tsx
import { createValueEmitter } from 'syncflow';

type User = Readonly<{ id: number; name: string }>;

// Create event emitter
const [userLoggedIn$, emitUserLoggedIn] = createValueEmitter<User>();

// Subscribe to events
userLoggedIn$.subscribe((user) => {
    console.log('User logged in:', user.name);
});

// Emit events
emitUserLoggedIn({ id: 1, name: 'Alice' });
```

### With React

```tsx
import * as React from 'react';
import { createState } from 'syncflow';

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

SyncFlow provides simple, intuitive APIs for managing application state:

- **`createState`**: Create mutable state with getter/setter
- **`createReducer`**: Redux-style state management
- **`createBooleanState`**: Specialized state for boolean values

### Event System

Built-in event emitter for event-driven patterns:

- **`createValueEmitter`**: Create type-safe event emitters
- **`createEventEmitter`**: Create event emitters without payload

### Observable (Optional Advanced Feature)

For advanced use cases, you can use observables to build complex reactive data flows. However, most applications will only need `createState`, `createReducer`, and `createValueEmitter`.

```tsx
import * as React from 'react';
import { createState } from 'syncflow';

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

## API Reference

### State Management (Recommended)

#### createState

Create reactive state with getter and setter:

```tsx
import * as React from 'react';
import { createEventEmitter, createValueEmitter } from 'syncflow';

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

#### createBooleanState

Specialized state for boolean values:

```tsx
import * as React from 'react';
import { createReducer } from 'syncflow';

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

#### createReducer

Create state with reducer pattern (like Redux):

```tsx
import * as React from 'react';
import { createBooleanState } from 'syncflow';

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

### Event System

#### createValueEmitter

Create type-safe event emitter with payload:

```tsx
import * as React from 'react';
import { createEventEmitter, createState, createValueEmitter } from 'syncflow';

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

#### createEventEmitter

Create event emitter without payload:

```tsx
import * as React from 'react';
import {
    createState,
    debounceTime,
    filter,
    fromPromise,
    type Observable,
    switchMap,
} from 'syncflow';
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

### Advanced Features (Optional)

For complex scenarios, SyncFlow provides observable-based APIs:

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
import { createState } from 'syncflow';
import { useState, useEffect } from 'react';

// Create global state
export const counterState = createState(0);

// Component 1
function Counter() {
    const [count, setCount] = useState(counterState.getSnapshot());

    useEffect(() => {
        const sub = counterState.state.subscribe(setCount);
        return () => sub.unsubscribe();
    }, []);

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => counterState.updateState((n) => n + 1)}>
                Increment
            </button>
        </div>
    );
}

// Component 2 (synced automatically)
function ResetButton() {
    return <button onClick={() => counterState.resetState()}>Reset</button>;
}
```

### Event-Driven Architecture (React)

```tsx
import { createValueEmitter } from 'syncflow';
import { useEffect } from 'react';

// Global events
export const [userLoggedIn$, emitUserLoggedIn] = createValueEmitter<{
    id: number;
    name: string;
}>();

export const [userLoggedOut$, emitUserLoggedOut] = createEventEmitter();

// Component that emits events
function LoginButton() {
    const handleLogin = async () => {
        const user = await loginUser();
        emitUserLoggedIn(user);
    };

    return <button onClick={handleLogin}>Login</button>;
}

// Component that listens to events
function Notification() {
    const [message, setMessage] = useState('');

    useEffect(() => {
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

    return message ? <div className="notification">{message}</div> : null;
}
```

### Todo List with Reducer (React)

```tsx
import { createReducer } from 'syncflow';
import { useState, useEffect } from 'react';

type Todo = { id: number; text: string; done: boolean };
type Action =
    | { type: 'add'; text: string }
    | { type: 'toggle'; id: number }
    | { type: 'remove'; id: number };

const todoState = createReducer<Todo[], Action>((todos, action) => {
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

function TodoList() {
    const [todos, setTodos] = useState(todoState.getSnapshot());

    useEffect(() => {
        const sub = todoState.state.subscribe(setTodos);
        return () => sub.unsubscribe();
    }, []);

    return (
        <div>
            {todos.map((todo) => (
                <div key={todo.id}>
                    <input
                        type="checkbox"
                        checked={todo.done}
                        onChange={() =>
                            todoState.dispatch({
                                type: 'toggle',
                                id: todo.id,
                            })
                        }
                    />
                    <span>{todo.text}</span>
                </div>
            ))}
            <button
                onClick={() =>
                    todoState.dispatch({
                        type: 'add',
                        text: 'New Todo',
                    })
                }
            >
                Add Todo
            </button>
        </div>
    );
}
```

### Boolean State (Dark Mode)

```tsx
import { createBooleanState } from 'syncflow';
import { useState, useEffect } from 'react';

export const darkModeState = createBooleanState(false);

function ThemeToggle() {
    const [isDark, setIsDark] = useState(darkModeState.getSnapshot());

    useEffect(() => {
        const sub = darkModeState.state.subscribe(setIsDark);
        return () => sub.unsubscribe();
    }, []);

    useEffect(() => {
        document.body.className = isDark ? 'dark' : 'light';
    }, [isDark]);

    return (
        <button onClick={() => darkModeState.toggle()}>
            {isDark ? '🌙' : '☀️'}
        </button>
    );
}
```

### Cross-Component Communication

```tsx
import { createValueEmitter, createState } from 'syncflow';
import { useState, useEffect } from 'react';
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
} from 'syncflow';
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

## Why SyncFlow?

### Simple State Management, Not Complex Reactive Programming

Unlike RxJS, which can make code harder to read with many operators and complex streams, SyncFlow focuses on **simple, readable state management and event handling**. Most applications only need `createState`, `createReducer`, and `createValueEmitter` - clean, straightforward APIs that developers understand immediately.

**Advanced reactive features are optional** and only used when you actually need them (like debouncing search input). The library doesn't force you into a reactive programming mindset.

### Key Differences from RxJS

- **Focus on State & Events**: Designed for state management and event-driven architecture
- **Simpler API**: Most use cases covered by `createState`, `createReducer`, and `createValueEmitter`
- **Better Readability**: No need for complex operator chains in everyday code
- **Optional Complexity**: Advanced features available when needed

### Use Cases

**Use SyncFlow when you need:**

- ✅ Global state management across components
- ✅ Event-driven communication between components
- ✅ Type-safe event emitters
- ✅ Redux-like state with reducers
- ✅ Simple reactive patterns (debounce, throttle, etc.)

**Consider other solutions when:**

- ❌ You need complex stream processing (use RxJS)
- ❌ Your app is simple enough for React Context alone

## Type Safety

SyncFlow maintains full type information:

```tsx
const userState = createState({ name: 'Alice', age: 25 });
// state type: Observable<{ name: string; age: number }>

const snapshot = userState.getSnapshot();
// snapshot type: { name: string; age: number }

const [onClick$, emitClick] = createValueEmitter<MouseEvent>();
// onClick$ type: Observable<MouseEvent>
// emitClick type: (event: MouseEvent) => void
```

## License

This project is licensed under the [Apache License 2.0](./LICENSE).

## Repository

<https://github.com/noshiro-pf/syncflow>

## Modules

- [core](core.md)
- [core/class](core/class.md)
- [core/class/child-observable-class](core/class/child-observable-class.md)
- [core/class/observable-base-class](core/class/observable-base-class.md)
- [core/class/root-observable-class](core/class/root-observable-class.md)
- [core/combine](core/combine.md)
- [core/combine/combine](core/combine/combine.md)
- [core/combine/merge](core/combine/merge.md)
- [core/combine/zip](core/combine/zip.md)
- [core/create](core/create.md)
- [core/create/from-array](core/create/from-array.md)
- [core/create/from-promise](core/create/from-promise.md)
- [core/create/from-subscribable](core/create/from-subscribable.md)
- [core/create/interval](core/create/interval.md)
- [core/create/of](core/create/of.md)
- [core/create/source](core/create/source.md)
- [core/create/timer](core/create/timer.md)
- [core/operators](core/operators.md)
- [core/operators/audit-time](core/operators/audit-time.md)
- [core/operators/debounce-time](core/operators/debounce-time.md)
- [core/operators/filter](core/operators/filter.md)
- [core/operators/map-with-index](core/operators/map-with-index.md)
- [core/operators/merge-map](core/operators/merge-map.md)
- [core/operators/pairwise](core/operators/pairwise.md)
- [core/operators/scan](core/operators/scan.md)
- [core/operators/skip-if-no-change](core/operators/skip-if-no-change.md)
- [core/operators/skip-until](core/operators/skip-until.md)
- [core/operators/skip-while](core/operators/skip-while.md)
- [core/operators/switch-map](core/operators/switch-map.md)
- [core/operators/take-until](core/operators/take-until.md)
- [core/operators/take-while](core/operators/take-while.md)
- [core/operators/throttle-time](core/operators/throttle-time.md)
- [core/operators/with-buffered-from](core/operators/with-buffered-from.md)
- [core/operators/with-current-value-from](core/operators/with-current-value-from.md)
- [core/operators/with-initial-value](core/operators/with-initial-value.md)
- [core/types](core/types.md)
- [core/types/id](core/types/id.md)
- [core/types/observable](core/types/observable.md)
- [core/types/observable-family](core/types/observable-family.md)
- [core/types/observable-kind](core/types/observable-kind.md)
- [core/types/types](core/types/types.md)
- [core/utils](core/utils.md)
- [core/utils/id-maker](core/utils/id-maker.md)
- [core/utils/max-depth](core/utils/max-depth.md)
- [core/utils/observable-utils](core/utils/observable-utils.md)
- [core/utils/utils](core/utils/utils.md)
- [entry-point](entry-point.md)
- [globals](globals.md)
- [utils](utils.md)
- [utils/create-event-emitter](utils/create-event-emitter.md)
- [utils/create-reducer](utils/create-reducer.md)
- [utils/create-state](utils/create-state.md)
