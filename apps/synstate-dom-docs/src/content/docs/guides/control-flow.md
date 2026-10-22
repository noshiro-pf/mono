---
title: Control flow
description: If, MatchOptional, MatchResult, For and Portal.
---

A component runs once, so an `if` or an early `return` in its body is evaluated once and never again. What changes over time is chosen by components: `If`, `MatchOptional`, `MatchResult` and `For`. Each mounts what it shows in a [scope](/mono/synstate-dom/guides/lifecycle/) of its own and disposes that scope when it shows something else. None of them adds a wrapper element; each marks its place with a comment node.

## `If`

```tsx
import { createBooleanState } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';

const [isLoggedIn$] = createBooleanState(false);

const Dashboard = (): JSX.Element => <main>{constant('Dashboard')}</main>;

const Login = (): JSX.Element => <main>{constant('Please log in')}</main>;

// Both branches are descriptions: only the chosen one is mounted, and
// `Dashboard` is not called at all until `isLoggedIn$` becomes true.
export const App = (): JSX.Element => (
    <If cond={isLoggedIn$} then={<Dashboard />} else={<Login />} />
);
```

- `cond: Bindable<boolean>`, `then: JSX.Element`, `else?: JSX.Element`. Nothing is shown for an omitted `else`.
- A JSX expression is a description, not DOM: writing both branches as props mounts only the one chosen.
- The branch is rebuilt only when `cond` flips. Flipping disposes the previous branch's scope and removes its nodes. A constant `cond` mounts one branch once and subscribes to nothing.

## `MatchOptional` and `MatchResult`

```tsx
import { createState, type InitializedObservable } from 'synstate';
import { constant, MatchOptional, view, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';

type User = Readonly<{ name: string }>;

const [currentUser$] = createState<Optional<User>>(Optional.none);

const Profile = ({
    user$,
}: Readonly<{ user$: InitializedObservable<User> }>): JSX.Element => (
    <p>{view(user$, (u) => `Signed in as ${u.name}`)}</p>
);

// `some` is called once per change from empty to present. While a user stays
// signed in, a new value flows through `u$` and the branch is kept.
export const Account = (): JSX.Element => (
    <MatchOptional
        value={currentUser$}
        some={(u$) => <Profile user$={u$} />}
        none={<p>{constant('Not signed in')}</p>}
    />
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

- `MatchOptional` takes a `Bindable<Optional<T>>`, `MatchResult` a `Bindable<Result<S, E>>`: the types of ts-data-forge.
- The branch functions receive an observable of the value narrowed to `T` (or `S`, `E`). A branch is rebuilt only when the tag changes; while it stays the same, new values flow through that observable.
- The observable is derived from `value`, not written to, so nothing is written while an update is propagating.

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
// receives its new item and index through `row$` and `index$`; reordering
// moves its nodes rather than recreating them.
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

- `items: Bindable<readonly T[]>`, `key: (item: T, index: number) => unknown`, and as children a function `(item$, index$) => JSX.Element`.
- `key` is required, as in React. To match rows by position, say so with `key={(_, i) => i}`; there is no separate `Index` component.
- The row function runs once per key. When the array changes, an existing row receives its new item and index through `item$` and `index$`, which are derived from `items`, and the row function is not called again. A new key gets a new row; a row whose key is gone has its scope disposed and its nodes removed.
- Rows are reordered with as few moves as the longest increasing subsequence allows.
- A key that appears twice is reported with `console.error`, as React does. It does not break anything, but each duplicate is rebuilt on every update.

## `Portal`

```tsx
import { createBooleanState } from 'synstate';
import { constant, If, Portal, type JSX } from 'synstate-dom';

const [isOpen$, { setFalse: close }] = createBooleanState(false);

// The dialog is mounted into `document.body`, out of any ancestor's
// `overflow: hidden`, but it belongs to the `If` branch: closing it removes
// the dialog too.
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

- Mounts its children into `target` (`document.body` when omitted) rather than where it is written, for a modal, a tooltip or a toast that has to escape an ancestor's `overflow: hidden` or `z-index`.
- The children belong to the scope where `Portal` is written: closing the enclosing branch removes them too.

## Calling them as functions

The control-flow components are plain functions that return a description, so `If({ cond, then: <A />, else: <B /> })` works the same as the JSX. There are no separate function forms such as `when(cond$, a, b)`: they are usually asked for to make the branches lazy, and a JSX expression already is.
