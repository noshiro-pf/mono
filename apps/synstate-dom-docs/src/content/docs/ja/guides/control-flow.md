---
title: 制御構文
description: If、MatchOptional、MatchResult、For、Portal。
---

コンポーネントは 1 回しか実行されないので、本体に書いた `if` や早期 return も 1 回評価されたきりです。時間とともに変わるものを切り替えたいときは、`If`・`MatchOptional`・`MatchResult`・`For` の各コンポーネントを使います。どれも表示するものをそれぞれの[スコープ](/mono/synstate-dom/ja/guides/lifecycle/)でマウントし、別のものに切り替えるときにそのスコープを破棄します。ラッパー要素は作らず、位置はコメントノードで示します。

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

- props は `cond: Bindable<boolean>`、`then: JSX.Element`、`else?: JSX.Element` です。`else` を省略すると、その側では何も表示しません。
- JSX の式は DOM ではなく記述なので、両方の分岐を props に書いても、マウントされるのは選ばれた側だけです。
- 分岐を作り直すのは `cond` が反転したときだけです。反転すると、前の分岐のスコープを破棄してノードを外します。`cond` が定数なら、分岐を 1 回マウントするだけで何も購読しません。

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

- `MatchOptional` は `Bindable<Optional<T>>` を、`MatchResult` は `Bindable<Result<S, E>>` を受け取ります。どちらも ts-data-forge の型です。
- 分岐の関数には、中身の型 `T`（または `S`、`E`）に絞り込んだ Observable が渡されます。分岐を作り直すのはタグが変わったときだけで、同じタグの間は新しい値がその Observable を流れてきます。
- この Observable は `value` から派生させたもので、誰かが書き込むわけではありません。そのため、伝播の途中で書き込みが起きることはありません。

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

- props は `items: Bindable<readonly T[]>` と `key: (item: T, index: number) => unknown` で、子には関数 `(item$, index$) => JSX.Element` を渡します。`index$` が作られるのは、Solid と同じく、関数が第 2 引数を宣言しているときだけです。位置を使わない行なら省略しましょう。行ごとに作るノードも、更新で走るノードも 1 つずつ減ります。
- `key` は React と同じく必須です。位置で対応づけたいときは `key={(_, i) => i}` と明示的に書いてください。専用の `Index` コンポーネントはありません。
- 行の関数はキーごとに 1 回だけ実行されます。配列が変わると、既存の行は `items` から派生した `item$` と `index$` を通して新しい要素と位置を受け取るので、行の関数がもう一度呼ばれることはありません。新しいキーには新しい行を作り、なくなったキーの行はスコープを破棄してノードを外します。
- 行を並べ替えるときは、最長増加部分列を使って移動を最小限にします。どのキーも同じ位置に残る更新では何も動かしません。残るキーが 1 つもない更新（全消去や全置き換え）では、古い行のノードをまとめて外します。
- 同じキーが 2 つ以上あると、React と同じく `console.error` で知らせます。壊れはしませんが、重複した行は更新のたびに作り直されます。

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

- 子要素を、書いた位置ではなく `target`（省略すると `document.body`）にマウントします。祖先の `overflow: hidden` や `z-index` の影響から逃がしたいモーダル・ツールチップ・トーストに使います。
- 子要素は `Portal` を書いた位置のスコープに属します。なので、囲んでいる分岐を閉じれば一緒に消えます。

## 関数として呼ぶ

制御構文のコンポーネントも記述を返すただの関数なので、`If({ cond, then: <A />, else: <B /> })` と書いても JSX と同じように動きます。`when(cond$, a, b)` のような関数版は別に用意していません。関数版がほしくなるのはたいてい分岐を遅延させたいときですが、JSX の式はもともと遅延しているからです。
