**synstate**

***

# SynState

<p align="center">
  <img src="_media/synstate-icon.png" alt="SynState Logo" width="400" />
</p>

<p align="center">

[![npm version](https://img.shields.io/npm/v/synstate.svg)](https://www.npmjs.com/package/synstate)
[![npm downloads](https://img.shields.io/npm/dm/synstate.svg)](https://www.npmjs.com/package/synstate)
[![License](https://img.shields.io/npm/l/synstate.svg)](./LICENSE)
[![codecov](https://codecov.io/gh/noshiro-pf/synstate/graph/badge.svg?token=xrJgTVxMpr)](https://codecov.io/gh/noshiro-pf/synstate)

</p>

**SynState** is a lightweight, high-performance, type-safe state management library for TypeScript/JavaScript applications. Perfect for building reactive global state and event-driven systems in React, Vue, and other frameworks.

## Features

- 🎯 **Simple State Management**: Easy-to-use `createState` and `createReducer` for global state
- 📡 **Event System**: Built-in `createValueEmitter`, `createEventEmitter` for event-driven architecture
- 🔄 **Reactive Updates**: Automatic propagation of state changes to all subscribers
- 🎨 **Type-Safe**: Full TypeScript support with precise type inference
- 🚀 **Lightweight**: Minimal bundle size with only one external runtime dependency ([ts-data-forge](https://www.npmjs.com/package/ts-data-forge))
- ⚡ **High Performance**: Optimized for fast state updates and minimal re-renders
- 🌐 **Framework Agnostic**: Works with React, Vue, Svelte, or vanilla JavaScript
- 🔧 **Observable-based**: Built on Observable pattern similar to RxJS, but with a completely independent implementation from scratch — not a wrapper. Offers optional advanced features like operators (`map`, `filter`, `scan`, `debounceTime`) and combinators (`merge`, `combine`)

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
const [state, setState, { updateState, resetState, getSnapshot }] =
    createState(0);

const mut_history: number[] = [];

// Subscribe to changes (in React components, Vue watchers, etc.)
state.subscribe((count) => {
    mut_history.push(count);
});

assert.deepStrictEqual(mut_history, [0]);

// Update state
setState(1);

assert.deepStrictEqual(mut_history, [0, 1]);

updateState((prev) => prev + 2);

assert.deepStrictEqual(mut_history, [0, 1, 3]);

assert.isTrue(getSnapshot() === 3);

resetState();

assert.isTrue(getSnapshot() === 0);
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

If you're using React v18 or later:

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

You can write the equivalent code more concisely using synstate-react-hooks:

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

See also the [synstate-react-hooks README](_media/README.md).

## Core Concepts

### State Management

SynState provides simple, intuitive APIs for managing application state:

- **`createState`**: Create state with getter/setter
- **`createReducer`**: Create state by reducer and initial value
- **`createBooleanState`**: Specialized state for boolean values

### Event System

Built-in event emitter for event-driven patterns:

- **`createValueEmitter`**: Create type-safe event emitters
- **`createEventEmitter`**: Create event emitters without payload

### Observable (Optional Advanced Feature)

For advanced use cases, you can use observables to build complex reactive data flows. However, most applications will only need `createState`, `createReducer`, and `createValueEmitter`.

## API Reference

For complex scenarios, SynState provides observable-based APIs:

### Creation Functions

- `source<T>()`: Create a new observable source
- `of(value)`: Create observable from a single value
- `fromArray(array)`: Create observable from array
- `fromPromise(promise)`: Create observable from promise
- `interval(ms)`: Emit values at intervals
- `timer(delay)`: Emit after delay

### Operators

- `filter(predicate)`: Filter values
- `map(fn)`: Transform values
- `scan(reducer, seed)`: Accumulate values
- `debounceTime(ms)`: Debounce emissions
- `throttleTime(ms)`: Throttle emissions
- `skipIfNoChange()`: Skip duplicate values
- `takeUntil(notifier)`: Complete on notifier emission

### Combination

- `combine(observables)`: Combine latest values from multiple sources
- `merge(observables)`: Merge multiple streams
- `zip(observables)`: Pair values by index

## Examples

### Global Counter State (React)

```tsx
import type * as React from 'react';
import { createState } from 'synstate-react-hooks';

// Create global state
export const [useCounterState, , { updateState, resetState, getSnapshot }] =
    createState(0);

// Component 1
const Counter = (): React.JSX.Element => {
    const count = useCounterState();

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

const initialTodos: readonly Todo[] = [];

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

// Events

### Advanced: Search with Debounce

```tsx
import type * as React from 'react';
import {
    createState,
    debounceTime,
    filter,
    fromPromise,
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

Under the hood, SynState is built on Observable patterns similar to those provided by RxJS. However, unlike RxJS, which can make code harder to read with many operators and complex streams, SynState focuses on **simple, readable state management and event handling**. Most applications only need `createState`, `createReducer`, and simple operators/combinators like `combine` and `map` — clean, straightforward APIs that developers understand immediately.

**Advanced reactive features are optional** and only used when you actually need them (like debouncing search input). The library doesn't force you into a reactive programming mindset.

### Key Differences from RxJS

- **Focus on State Management**: Designed specifically for state management, not just asynchronous event processing
- **InitializedObservable**: Provides `InitializedObservable` which always holds an initial value, making it ideal for representing state
- **Simpler API**: Most use cases are covered by `createState`, `createReducer`, and `createEventEmitter`
- **Better Readability**: No need for complex operator chains in everyday code
- **Optional Complexity**: Advanced features available to manipulate Observables when needed

### Use Cases

**Use SynState when you need:**

- ✅ Global state management across components
- ✅ Event-driven communication between components
- ✅ Type-safe event emitters
- ✅ Redux-like state with reducers
- ✅ Simple reactive patterns (debounce, throttle, etc.)

**Consider other solutions when:**

- ❌ You need state in a React component (use React hooks `useState`, `useReducer`)
- ❌ Your app is simple enough for React Context alone

## Type Safety

SynState maintains full type information.

## License

This project is licensed under the [Apache License 2.0](./LICENSE).

## Repository

<https://github.com/noshiro-pf/synstate>

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
- [core/predefined](core/predefined.md)
- [core/predefined/operators](core/predefined/operators.md)
- [core/predefined/operators/attach-index](core/predefined/operators/attach-index.md)
- [core/predefined/operators/map](core/predefined/operators/map.md)
- [core/predefined/operators/map-optional](core/predefined/operators/map-optional.md)
- [core/predefined/operators/map-result-err](core/predefined/operators/map-result-err.md)
- [core/predefined/operators/map-result-ok](core/predefined/operators/map-result-ok.md)
- [core/predefined/operators/map-to](core/predefined/operators/map-to.md)
- [core/predefined/operators/pluck](core/predefined/operators/pluck.md)
- [core/predefined/operators/skip](core/predefined/operators/skip.md)
- [core/predefined/operators/take](core/predefined/operators/take.md)
- [core/predefined/operators/unwrap-optional](core/predefined/operators/unwrap-optional.md)
- [core/predefined/operators/unwrap-result-err](core/predefined/operators/unwrap-result-err.md)
- [core/predefined/operators/unwrap-result-ok](core/predefined/operators/unwrap-result-ok.md)
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
