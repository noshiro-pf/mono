---
title: Todo list
description: A todo list with If, For, class objects and a derivation local to the view.
---

This is the larger sample from the README: an input, a list that appears once it has items, and a count of what is left.

```tsx
import { createState, map } from 'synstate';
import { constant, For, If, render, view, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';

type Todo = Readonly<{ id: number; title: string; done: boolean }>;

const [todos$, _setTodos, { updateState: updateTodos }] = createState<
    readonly Todo[]
>([]);

const [draft$, setDraft, { getSnapshot: getDraft }] = createState('');

const toggle = (id: number): void => {
    updateTodos((todos) =>
        todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
};

const add = (): void => {
    const title = getDraft().trim();

    if (title === '') {
        return;
    }

    // Todos are only ever appended, so the length is a unique key. `Date.now()`
    // is not: two todos added within the same millisecond would share it.
    updateTodos((todos) =>
        Arr.toPushed(todos, { id: todos.length, title, done: false }),
    );

    setDraft('');
};

// `For` keeps one row per key: a row's function runs once, and reordering
// `todos$` moves the row's nodes rather than recreating them.
const TodoApp = (): JSX.Element => {
    // A derivation only this view reads is created here, inside the component, so
    // it exists only while the view is mounted.
    const remaining$ = todos$.pipe(
        map((todos) => todos.filter((t) => !t.done).length),
    );

    return (
        <section>
            <input
                value={draft$}
                onInput={(e) => {
                    setDraft(e.currentTarget.value);
                }}
            />
            <button type={constant('button')} onClick={add}>
                {constant('Add')}
            </button>
            <If
                cond={view(todos$, Arr.isNonEmpty)}
                then={
                    <ul>
                        <For items={todos$} key={(todo) => todo.id}>
                            {(todo$, index$) => (
                                <li
                                    class={{
                                        done: view(todo$, (todo) => todo.done),
                                    }}
                                >
                                    <label>
                                        <input
                                            type={constant('checkbox')}
                                            checked={view(
                                                todo$,
                                                (todo) => todo.done,
                                            )}
                                            onChange={() => {
                                                toggle(
                                                    todo$.getSnapshot().value
                                                        .id,
                                                );
                                            }}
                                        />
                                        {view(index$, (i) => `${i + 1}. `)}
                                        {view(todo$, (todo) => todo.title)}
                                    </label>
                                </li>
                            )}
                        </For>
                    </ul>
                }
                else={<p>{constant('Nothing to do.')}</p>}
            />
            <p>{view(remaining$, (n) => `${n} remaining`)}</p>
        </section>
    );
};

render(TodoApp, document.body);
```

What to look at:

- **`For` keeps one row per `todo.id`.** When you toggle a todo, a new array is written to `todos$`, but the row's function is not called again: only that row's `checked` property, `done` class and text change.
- **`remaining$` is created inside `TodoApp`**, since only this view reads it. It belongs to the root scope and is disposed on unmount. See [Lifecycle and scopes](/mono/synstate-dom/guides/lifecycle/#two-habits).
- **The list and the "Nothing to do." paragraph are both descriptions** given to `If`. Only one is mounted at a time, and switching disposes the other's scope, `For` and its rows included.
- **The event handlers only write to states** (`setDraft`, `updateTodos`) and create no observables.
