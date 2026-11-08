---
title: Control flow
description: If, MatchOptional, MatchResult, Switch, For, selector and Portal.
---

A component runs once, so an `if` or an early `return` in its body is evaluated once and never again. To choose something that changes over time, use a component: `If`, `MatchOptional`, `MatchResult` or `Switch` to choose a branch, `For` to repeat one. Each mounts what it shows in an [owner](/mono/synstate-dom-next/guides/lifecycle/) of its own, and disposes that owner when it switches to something else. None of them adds a wrapper element: one bound to an observable marks its place with a comment node at each end.

All of them change the DOM once every value of the update that changed their input is up to date, so mounting and unmounting never happen in the middle of a propagation. What they decide, they decide earlier: in the update itself, before the nodes of a branch or a row are visited. A branch that goes, or a row whose key is gone, is never computed from the value that rules it out.

## `If`

```tsx
import { constant, If, type JSX } from 'synstate-dom-next';
import { createBooleanState } from 'synstate-next';

const [isLoggedIn$] = createBooleanState(false);

// Both branches are descriptions: only the chosen one is mounted, and
// `Dashboard` is not called at all until `isLoggedIn$` becomes true.
export const App = (): JSX.Element => (
    <If cond={isLoggedIn$} then={<Dashboard />} else={<Login />} />
);

const Dashboard = (): JSX.Element => <main>{constant('Dashboard')}</main>;

const Login = (): JSX.Element => <main>{constant('Please log in')}</main>;
```

- `cond: Bindable<boolean>`, `then: JSX.Element`, `else?: JSX.Element`. If you omit `else`, nothing is shown on that side.
- A JSX expression is a description, not DOM, so you can write both branches as props and only the chosen one mounts.
- The branch is rebuilt only when `cond` flips, which disposes the previous branch's owner and removes its nodes. With a constant `cond`, `If` mounts one branch once, with no comment around it, and makes nothing to follow it.

## `MatchOptional` and `MatchResult`

```tsx
import { constant, MatchOptional, type JSX } from 'synstate-dom-next';
import { createState, map, type InitializedObservable } from 'synstate-next';
import { Optional } from 'ts-std-forge';

type User = Readonly<{ name: string }>;

const [currentUser$] = createState<Optional<User>>(Optional.none);

// `some` is called once per change from empty to present. While a user stays
// signed in, a new value flows through `u$` and the branch is kept.
export const Account = (): JSX.Element => (
    <MatchOptional
        value={currentUser$}
        some={(u$) => <Profile user$={u$} />}
        none={<p>{constant('Not signed in')}</p>}
    />
);

const Profile = ({
    user$,
}: Readonly<{ user$: InitializedObservable<User> }>): JSX.Element => (
    <p>{user$.pipe(map((u) => `Signed in as ${u.name}`))}</p>
);
```

```tsx
import { constant, MatchResult, type JSX } from 'synstate-dom-next';
import { createState, map } from 'synstate-next';
import { Result } from 'ts-std-forge';

const [parsed$] = createState<Result<number, string>>(Result.ok(0));

export const ParsedValue = (): JSX.Element => (
    <MatchResult
        value={parsed$}
        ok={(value$) => <output>{value$}</output>}
        err={(error$) => (
            <p role={constant('alert')}>
                {error$.pipe(map((e) => `Error: ${e}`))}
            </p>
        )}
    />
);
```

- `MatchOptional` takes a `Bindable<Optional<T>>` and `MatchResult` a `Bindable<Result<S, E>>`, both types from ts-std-forge.
- Each branch function receives an observable of the value narrowed to `T` (or `S`, `E`). The branch is rebuilt only when the tag changes; while the tag stays the same, new values just flow through that observable.
- That observable is a `map` of `value` made inside the branch. When `value` turns to the other tag, the branch is taken out of the update before that `map` is reached, so it never computes from a value of the wrong tag.

## `Switch`

`If`, `MatchOptional` and `MatchResult` are one component, `Switch`, with a key fixed for you: the condition, `isSome` or `isOk`. `Switch` takes the key function itself:

```tsx
import { constant, Switch, type JSX } from 'synstate-dom-next';
import { createState, map } from 'synstate-next';

type Page = Readonly<
    { kind: 'list' } | { kind: 'item'; id: number } | { kind: 'settings' }
>;

const [page$, setPage] = createState<Page>({ kind: 'list' });

// One branch per key. Moving from one item to another keeps the `item` branch,
// and its text follows `page$`; moving to the settings mounts another.
export const Router = (): JSX.Element => (
    <main>
        <Switch value={page$} key={(page) => page.kind}>
            {(kind) =>
                kind === 'list' ? (
                    <ItemList />
                ) : kind === 'item' ? (
                    <p>
                        {page$.pipe(
                            map((page) =>
                                page.kind === 'item' ? `Item ${page.id}` : '',
                            ),
                        )}
                    </p>
                ) : (
                    <p>{constant('Settings')}</p>
                )
            }
        </Switch>
    </main>
);

const ItemList = (): JSX.Element => (
    <button
        type={constant('button')}
        onClick={() => {
            setPage({ kind: 'item', id: 1 });
        }}
    >
        {constant('Open item 1')}
    </button>
);
```

- `value: Bindable<V>`, `key: (value: V) => K`, and as children a function `(key, value) => JSX.Element | undefined`. `undefined` shows nothing for that key.
- The branch is mounted for the key of the value and kept while the key stays. Keys are compared with `Object.is`, so a key is a primitive, or an object kept as it is: a key built afresh for each value, such as `[page.kind, page.id]`, mounts the branch again on every value.
- `key` is called once per value, in the update, before any node of the branch computes. A `key` that throws drops the branch and leaves the `Switch` empty until the next value; the exception is thrown as the `Switch`'s own, and the rest of the page is updated. One that throws while the `Switch` first mounts fails that mount.
- What the branch shows from the value it reads through an observable it makes, `value.pipe(map(...))`, as the `item` branch above does. An observable made where the JSX is written, outside the branch, is not the branch's: it computes from every value, shown or not.

## `For`

```tsx
import { For, type JSX } from 'synstate-dom-next';
import { createState, map } from 'synstate-next';

type Row = Readonly<{ id: number; label: string }>;

const [rows$] = createState<readonly Row[]>([
    { id: 1, label: 'first' },
    { id: 2, label: 'second' },
]);

// The row function runs once per key. When `rows$` changes, an existing row
// receives its new item and index through `row$` and `index$`; reordering moves
// its nodes rather than recreating them.
export const Table = (): JSX.Element => (
    <ul>
        <For items={rows$} key={(row) => row.id}>
            {(row$, index$) => (
                <li>
                    {index$.pipe(map((i) => `${i + 1}. `))}
                    {row$.pipe(map((row) => row.label))}
                </li>
            )}
        </For>
    </ul>
);
```

- `items: Bindable<readonly T[]>`, `key: (item: T, index: number) => unknown`, and as children a function `(item$, index$) => JSX.Element`. As in Solid, `index$` is created only when the function declares a second parameter. If a row does not need its position, leave the parameter out, and each row has one node fewer.
- `key` is required, as in React. To match rows by position, say so with `key={(_, i) => i}`; there is no separate `Index` component.
- The row function runs once per key, in an owner of the row's own. Behind `item$` and `index$` each row keeps a state. When `items` changes, a row whose key stays is not rebuilt: its state is set to the new element, which reaches only what reads that row, and rows whose element did not change are not visited at all. A new key mounts a row, and a key that went disposes its row's owner and removes its nodes.
- Those writes to the rows' states start an update of their own, right after the one that changed `items`, so a row reads its new element one update later than `items` changed. Both happen before anything is painted.
- When the keys are the same, in the same order, nothing is moved and the keyed diff is skipped. Otherwise the rows that stay are moved as little as the longest increasing run of their old positions allows, and an update that keeps no key (clearing or replacing the whole list) removes the old rows' nodes in one go.
- If a key appears twice, `For` reports it with `console.error`, as React does.

## `selector`

Selecting one row of many is common enough to have a helper. `selector(source).is(key)` is an observable that is `true` while `source` holds `key`:

```tsx
import { For, selector, type JSX } from 'synstate-dom-next';
import { createState, map } from 'synstate-next';

type Row = Readonly<{ id: number; label: string }>;

const [rows$] = createState<readonly Row[]>([
    { id: 1, label: 'first' },
    { id: 2, label: 'second' },
]);

const [selectedId$, setSelectedId] = createState<number | undefined>(undefined);

// Made once, outside the rows: it remembers which rows watch which id.
const selected = selector(selectedId$);

// Selecting a row writes to two rows (the one that was selected and the one
// that is), however many rows there are.
export const Table = (): JSX.Element => (
    <ul>
        <For items={rows$} key={(row) => row.id}>
            {(row$) => (
                <li
                    class={{ selected: selected.is(row$.value.id) }}
                    onClick={() => {
                        setSelectedId(row$.value.id);
                    }}
                >
                    {row$.pipe(map((row) => row.label))}
                </li>
            )}
        </For>
    </ul>
);
```

When `source` changes, only the observables of the old key and the new one are written, however many rows watch it. A `source.pipe(map((s) => s === id))` per row would compute in every row and pass a change on in two. Like the rows' states, those writes start an update of their own. An `is` observable belongs to the owner it was made in, and is forgotten when that owner is disposed.

## `Portal`

```tsx
import { constant, If, Portal, type JSX } from 'synstate-dom-next';
import { createBooleanState } from 'synstate-next';

const [isOpen$, { setFalse: close }] = createBooleanState(false);

// The dialog is mounted into `document.body`, out of any ancestor's
// `overflow: hidden`, but it belongs to the `If` branch: closing it removes the
// dialog too.
export const Modal = (): JSX.Element => (
    <If
        cond={isOpen$}
        then={
            <Portal target={document.body}>
                <div role={constant('dialog')}>
                    <button type={constant('button')} onClick={close}>
                        {constant('Close')}
                    </button>
                </div>
            </Portal>
        }
    />
);
```

- `Portal` mounts its children into `target` (`document.body` when omitted) instead of where you write it, in `target`'s namespace. Use it for a modal, a tooltip or a toast that has to escape an ancestor's `overflow: hidden` or `z-index`.
- The children still belong to the owner where you wrote `Portal`, so closing the enclosing branch removes them too.

## Calling them as functions

The control-flow components are plain functions that return a description, so writing `If({ cond, then: <A />, else: <B /> })` works the same as the JSX. There is no separate function form such as `when(cond$, a, b)`. People usually ask for one to make the branches lazy, and a JSX expression already is.
