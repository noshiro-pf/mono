---
title: 制御構文
description: If、MatchOptional、MatchResult、For、Portal。
---

コンポーネントは 1 回しか実行されないので、本体の `if` や早期 return は 1 回評価されたきりになる。時間とともに変わるものは、`If`・`MatchOptional`・`MatchResult`・`For` のコンポーネントで選ぶ。どれも表示するものをそれぞれの[スコープ](/mono/synstate-dom/ja/guides/lifecycle/)でマウントし、別のものを表示するときにそのスコープを破棄する。ラッパー要素は作らず、位置をコメントノードで示す。

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

- `cond: Bindable<boolean>`、`then: JSX.Element`、`else?: JSX.Element`。`else` を省略した側では何も表示しない。
- JSX の式は DOM ではなく記述なので、両方の分岐を props に書いても、マウントされるのは選ばれた側だけである。
- 分岐は `cond` が反転したときだけ作り直す。反転すると前の分岐のスコープを破棄してノードを外す。`cond` が定数なら分岐を 1 回だけマウントし、何も購読しない。

## `MatchOptional` と `MatchResult`

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

- `MatchOptional` は `Bindable<Optional<T>>` を、`MatchResult` は `Bindable<Result<S, E>>` を受け取る。ts-data-forge の型である。
- 分岐の関数は、中身の型 `T`（または `S`、`E`）に絞った Observable を受け取る。分岐はタグが変わったときだけ作り直し、同じタグの間は新しい値がその Observable を流れる。
- この Observable は `value` から派生させたもので、書き込まれるわけではない。そのため伝播中に書き込みは起きない。

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

- `items: Bindable<readonly T[]>`、`key: (item: T, index: number) => unknown`、子は関数 `(item$, index$) => JSX.Element`。
- `key` は React と同じく必須。位置で対応づけるときは `key={(_, i) => i}` と明示する。専用の `Index` コンポーネントはない。
- 行の関数はキーごとに 1 回だけ実行される。配列が変わると、既存の行は `items` から派生した `item$` と `index$` を通して新しい要素と位置を受け取り、行の関数は再び呼ばれない。新しいキーには新しい行を作り、キーが消えた行はスコープを破棄してノードを外す。
- 行の並べ替えは、最長増加部分列で移動を最小にする。
- 同じキーが 2 つ以上あると、React と同じく `console.error` で知らせる。壊れはしないが、重複した行は更新のたびに作り直される。

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

- 子要素を、書かれた位置ではなく `target`（省略時は `document.body`）にマウントする。祖先の `overflow: hidden` や `z-index` から逃がしたいモーダル・ツールチップ・トーストに使う。
- 子要素は `Portal` が書かれた位置のスコープに属するので、囲む分岐を閉じれば一緒に消える。

## 関数として呼ぶ

制御構文のコンポーネントは記述を返すただの関数なので、`If({ cond, then: <A />, else: <B /> })` と書いても JSX と同じに動く。`when(cond$, a, b)` のような関数版は別に用意していない。関数版は分岐を遅延させるために求められることが多いが、JSX の式はもともと遅延している。
