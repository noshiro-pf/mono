---
title: Control flow
description: If, MatchOptional, MatchResult, For and Portal.
---

A component runs once, so an `if` or an early `return` in its body is evaluated once and never again. To choose something that changes over time, use a component: `If`, `MatchOptional`, `MatchResult` or `For`. Each mounts what it shows in a [scope](/mono/synstate-dom/guides/lifecycle/) of its own, and disposes that scope when it switches to something else. None of them adds a wrapper element; each marks its place with a comment node.

## `If`

```tsx
import { createBooleanState } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';

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
- The branch is rebuilt only when `cond` flips, which disposes the previous branch's scope and removes its nodes. With a constant `cond`, `If` mounts one branch once and subscribes to nothing.

## `MatchOptional` and `MatchResult`

```tsx
import { createState, type InitializedObservable } from 'synstate';
import { constant, MatchOptional, view, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';

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
    <p>{view(user$, (u) => `Signed in as ${u.name}`)}</p>
);
```

```tsx
import { createState } from 'synstate';
import { constant, MatchResult, view, type JSX } from 'synstate-dom';
import { Result } from 'ts-data-forge';

const [parsed$] = createState<Result<number, string>>(Result.ok(0));

export const ParsedValue = (): JSX.Element => (
    <MatchResult
        value={parsed$}
        ok={(value$) => <output>{value$}</output>}
        err={(error$) => (
            <p role={constant('alert')}>{view(error$, (e) => `Error: ${e}`)}</p>
        )}
    />
);
```

- `MatchOptional` takes a `Bindable<Optional<T>>` and `MatchResult` a `Bindable<Result<S, E>>`, both types from ts-data-forge.
- Each branch function receives an observable of the value narrowed to `T` (or `S`, `E`). The branch is rebuilt only when the tag changes; while the tag stays the same, new values just flow through that observable.
- That observable is derived from `value` rather than written to, so nothing gets written while an update is still propagating.

## `For`

```tsx
import { createState } from 'synstate';
import { For, view, type JSX } from 'synstate-dom';

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
                    {view(index$, (i) => `${i + 1}. `)}
                    {view(row$, (row) => row.label)}
                </li>
            )}
        </For>
    </ul>
);
```

- `items: Bindable<readonly T[]>`, `key: (item: T, index: number) => unknown`, and as children a function `(item$, index$) => JSX.Element`. As in Solid, `index$` is created only when the function declares a second parameter. If a row does not need its position, leave the parameter out, and each row has one node fewer to create and update.
- `key` is required, as in React. To match rows by position, say so with `key={(_, i) => i}`; there is no separate `Index` component.
- The row function runs once per key. When the array changes, an existing row receives its new item and index through `item$` and `index$` (both derived from `items`), and the row function is not called again. A new key gets a new row, and when a key goes away, its row's scope is disposed and its nodes removed.
- `For` reorders rows with as few moves as the longest increasing subsequence allows. An update that keeps every key in place moves nothing, and one that keeps no key (clearing or replacing the whole list) removes the old rows' nodes in one go.
- If a key appears twice, `For` reports it with `console.error`, as React does. Nothing breaks, but each duplicate is rebuilt on every update.

## `Portal`

```tsx
import { createBooleanState } from 'synstate';
import { constant, If, Portal, type JSX } from 'synstate-dom';

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

- `Portal` mounts its children into `target` (`document.body` when omitted) instead of where you write it. Use it for a modal, a tooltip or a toast that has to escape an ancestor's `overflow: hidden` or `z-index`.
- The children still belong to the scope where you wrote `Portal`, so closing the enclosing branch removes them too.

## Calling them as functions

The control-flow components are plain functions that return a description, so writing `If({ cond, then: <A />, else: <B /> })` works the same as the JSX. There is no separate function form such as `when(cond$, a, b)`. People usually ask for one to make the branches lazy, and a JSX expression already is.
