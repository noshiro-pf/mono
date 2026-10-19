# synstate-dom

A compiler-free, fine-grained UI library that binds [synstate](https://github.com/noshiro-pf/mono/tree/main/libs/synstate) observables directly to the DOM.

> [!WARNING]
> Under development and not published yet. The design is in [`SPEC.md`](./SPEC.md) (Japanese); this README grows as the implementation catches up.

## Usage

Set the JSX transform to this package in `tsconfig.json`:

```jsonc
{
    "compilerOptions": {
        "jsx": "react-jsx",
        "jsxImportSource": "synstate-dom",
    },
}
```

A component is called once. What changes afterwards is only the DOM bound to the observables it was given:

```tsx
import { createState } from 'synstate';
import { constant, render, view, type JSX } from 'synstate-dom';

const [count$, _setCount, { updateState: updateCount }] = createState(0);

// Called once. Only the text node bound to `count$` changes afterwards.
const Counter = (): JSX.Element => (
    <div>
        <p>{view(count$, (n) => `Count: ${n}`)}</p>
        <button
            type={constant('button')}
            onClick={() => {
                updateCount((n) => n + 1);
            }}
        >
            {constant('+1')}
        </button>
    </div>
);

const unmount = render(Counter, document.body);

// Later: disposes every subscription the app made and removes its nodes.
unmount();
```

Text in JSX is a `Bindable` too: write `constant('Add')`, not `Add`, so that a value which never changes says so and a value which does change cannot be passed by mistake as a snapshot. `If`, `MatchOptional`, `MatchResult` and `For` mount what they choose in a scope of its own and dispose it when they choose something else:

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
    // A derivation only this view reads is created here, inside the component,
    // so it exists only while the view is mounted.
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

A component that takes data takes `Bindable<T>`, so that its caller can pass an observable, a constant or a `view` alike. Props are bindables rather than values, so destructuring them loses nothing:

```tsx
import { createState } from 'synstate';
import {
    constant,
    mapBindable,
    render,
    type Bindable,
    type JSX,
} from 'synstate-dom';

type BadgeProps = Readonly<{
    label: Bindable<string>;
    count: Bindable<number>;
}>;

// Props are plain values holding bindables, so destructuring them is safe:
// the component is called once and binds what it was given.
const Badge = ({ label, count }: BadgeProps): JSX.Element => (
    <span>
        {label}
        {mapBindable(count, (n) => (n > 99 ? ' (99+)' : ` (${n})`))}
    </span>
);

const [unread$, setUnread] = createState(3);

const Inbox = (): JSX.Element => (
    <nav>
        {/* A constant stays a constant: nothing is subscribed for it. */}
        <Badge label={constant('Inbox')} count={unread$} />
        <Badge label={constant('Archive')} count={constant(120)} />
        <button
            type={constant('button')}
            onClick={() => {
                setUnread(0);
            }}
        >
            {constant('Mark all read')}
        </button>
    </nav>
);

render(Inbox, document.body);
```

### Guidelines

synstate derivations are not lazy: a derivation is computed whenever its parent changes, read or not. Two habits keep a derivation from being computed for a view that is not shown:

1. **Create a derivation only a view reads inside the component**, not next to the store. It then exists only while something is bound to it.
2. **Create what a branch shows inside the branch** (the `then` of `If`, the function of `MatchOptional`), not before choosing between two of them.

## What is implemented

- `Constant<T>` and `constant(value)`: a value written once and never updated.
- `Bindable<T>`: what a slot that takes data accepts, `InitializedObservable<T> | Constant<T> | View<T>`. A plain value is a type error.
- `view(source, fn)`: an observable and a light transformation, bound without creating a node in the graph.
- `mapBindable`, `derive` and `toObservable`: helpers for a component that receives a `Bindable`. Constants stay constants and never enter the graph.
- The JSX runtime (`"jsx": "react-jsx"`, `"jsxImportSource": "synstate-dom"`): a JSX expression is a lazy `Mountable` description, and a component is called once, when it is mounted.
- `render(App, container)`: mounts `App` in a root scope and returns the function that unmounts it.
- Element props: attributes and DOM properties typed from `lib.dom.d.ts` (`Bindable<T>` of each writable primitive property), `aria-*` and `data-*`, `class` as a string or a `{ name: Bindable<boolean> }` object, `style` as a string or a per-property object, and `onClick`-style event handlers. SVG elements are created in the SVG namespace and take a fixed list of attributes.
- `If`, `MatchOptional` and `MatchResult`: mount one branch at a time in a scope of its own, rebuilt only when the condition or the tag changes.
- `For`: one row per key, each in a scope of its own; `item$` and `index$` are derived from `items`, and rows are moved as little as the longest increasing subsequence allows.
- `Portal`: mounts its children into another element, in the scope where it is written.

## Naming

The library's own props and parameters carry no `$` suffix (`cond`, `items`, `value`): they take a `Bindable`, which may be a constant or a view as well as an observable, and the type already says which. The samples name variables that hold an observable with a `$` suffix (`count$`, `item$`), as the synstate documentation does, to tell them from plain values at a glance. Nothing enforces it; whether a component's own props carry the suffix is up to its author.
