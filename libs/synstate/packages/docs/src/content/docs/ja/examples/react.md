---
title: React の使用例
sidebar:
    order: 1
---

## グローバルカウンター

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

## Reducer を使った Todo リスト

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

## Boolean 状態（ダークモード）

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

## コンポーネント間通信

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
