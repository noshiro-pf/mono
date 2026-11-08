---
title: 制御フロー
description: If、MatchOptional、MatchResult、Switch、For、selector、Portal。
---

コンポーネントは 1 回しか実行されないので、本体の `if` や早期 `return` は 1 回評価されたきり二度と評価されません。時間とともに変わるものを選ぶにはコンポーネントを使います。分岐を選ぶなら `If`・`MatchOptional`・`MatchResult`・`Switch`、繰り返すなら `For` です。どれも表示するものを専用の [owner](/mono/synstate-dom-next/ja/guides/lifecycle/) の中でマウントし、別のものに切り替えるときにその owner を破棄します。どれもラッパー要素を足しません。Observable を束縛したものは、両端のコメントノードで自分の位置を示します。

どれも、入力を変えた更新が落ち着いた後で DOM を変えるので、マウントやアンマウントが伝播の途中に起きることはありません。何をどうするかは、それより前、更新そのものの中で、分岐や行のノードを訪れる前に決めます。外れる分岐や、キーが無くなった行が、それを外す値で計算されることはありません。

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

- `cond: Bindable<boolean>`、`then: JSX.Element`、`else?: JSX.Element`。`else` を省略すると、その側では何も表示しません。
- JSX の式は DOM ではなく記述なので、両方の分岐を props に書いても、マウントされるのは選ばれた方だけです。
- 分岐は `cond` が反転したときだけ作り直され、そのとき前の分岐の owner を破棄してノードを取り除きます。`cond` が constant なら、`If` は 1 つの分岐をコメントなしで 1 回マウントするだけで、追いかけるためのものは何も作りません。

## `MatchOptional` と `MatchResult`

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

- `MatchOptional` は `Bindable<Optional<T>>` を、`MatchResult` は `Bindable<Result<S, E>>` を受け取ります。どちらも ts-std-forge の型です。
- 各分岐の関数は、`T`（または `S`・`E`）に絞り込んだ値の Observable を受け取ります。分岐はタグが変わったときだけ作り直され、タグが同じ間は新しい値がその Observable を流れるだけです。
- その Observable は、分岐の中で作った `value` の `map` です。`value` のタグが変わると、その `map` に届く前に更新の中で分岐が外されるので、違うタグの値で計算することはありません。

## `Switch`

`If`・`MatchOptional`・`MatchResult` は、キーをあらかじめ決めた 1 つのコンポーネント `Switch` です。キーは条件・`isSome`・`isOk` です。`Switch` はキーの関数そのものを受け取ります。

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

- `value: Bindable<V>`、`key: (value: V) => K`、子として関数 `(key, value) => JSX.Element | undefined`。`undefined` は、そのキーでは何も表示しないという意味です。
- 分岐は値のキーに対してマウントされ、キーが同じ間は保たれます。キーは `Object.is` で比べるので、キーはプリミティブか、そのまま保たれるオブジェクトにします。`[page.kind, page.id]` のように値ごとに作り直すキーだと、値が来るたびに分岐をマウントし直します。
- `key` は値ごとに 1 回、更新の中で、分岐のノードが計算される前に呼ばれます。`key` が例外を投げると分岐を外し、次の値まで switch は空になります。例外は switch 自身の例外として投げられ、ページの残りは更新されます。switch の最初のマウント中に投げると、そのマウントが失敗します。
- 分岐が値から表示するものは、分岐が作る Observable `value.pipe(map(...))` を通して読みます。上の `item` の分岐がそうです。JSX を書いた場所、つまり分岐の外で作った Observable は分岐のものではなく、表示されているかどうかにかかわらず値が来るたびに計算します。

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

- `items: Bindable<readonly T[]>`、`key: (item: T, index: number) => unknown`、子として関数 `(item$, index$) => JSX.Element`。Solid と同じく、`index$` は関数が 2 つ目の引数を宣言しているときだけ作られます。行が自分の位置を必要としないなら引数を省略してください。各行のノードが 1 つ減ります。
- React と同じく `key` は必須です。位置で行を対応づけるなら `key={(_, i) => i}` と明示してください。別の `Index` コンポーネントはありません。
- 行の関数はキーごとに 1 回、行専用の owner の中で実行されます。各行は `item$` と `index$` の裏に状態を持っています。`items` が変わると、キーが残った行は作り直されず、その状態に新しい要素が書き込まれます。起きるのはその行を読むものだけで、要素が変わらなかった行は訪れもしません。新しいキーには行がマウントされ、無くなったキーの行はその owner を破棄してノードを取り除きます。
- 行の状態へのこれらの書き込みは、`items` を変えた更新のすぐ後に、それ自身の更新を始めます。そのため、行が新しい要素を読むのは `items` が変わった 1 つ後の更新です。どちらも描画より前に起きます。
- キーが同じ順で同じなら、何も動かさず、キーによる差分も取りません。そうでなければ、残る行を、元の位置の最長増加列が許すかぎり少なく動かします。キーが 1 つも残らない更新（リストを空にする、まるごと置き換える）は、古い行のノードを一度に取り除きます。
- 同じキーが 2 回現れると、React と同じく `For` が `console.error` で報告します。

## `selector`

多くの行から 1 行を選ぶのはよくあることなので、ヘルパーがあります。`selector(source).is(key)` は、`source` が `key` を持つ間 `true` になる Observable です。

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

`source` が変わると、書き込まれるのは古いキーと新しいキーの Observable だけで、それを見ている行がいくつあっても変わりません。行ごとの `source.pipe(map((s) => s === id))` だと、すべての行で計算し、2 行に変更を渡します。行の状態と同じく、これらの書き込みはそれ自身の更新を始めます。`is` の Observable は作られた owner に属し、その owner が破棄されると忘れられます。

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

- `Portal` は、子を書いた場所ではなく `target`（省略時は `document.body`）に、`target` の名前空間でマウントします。祖先の `overflow: hidden` や `z-index` から抜け出す必要のあるモーダル・ツールチップ・トーストに使ってください。
- 子は `Portal` を書いた場所の owner に属したままなので、それを囲む分岐を閉じると子も取り除かれます。

## 関数として呼ぶ

制御フローのコンポーネントは記述を返す普通の関数なので、`If({ cond, then: <A />, else: <B /> })` と書いても JSX と同じように動きます。`when(cond$, a, b)` のような別の関数形式はありません。そうした形式は分岐を遅延させるために求められることが多いのですが、JSX の式はもともと遅延しています。
