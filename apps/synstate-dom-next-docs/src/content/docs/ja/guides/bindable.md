---
title: Bindable
description: constant、pipe(map)、そしてデータを受け取る props と属性が受け付けるもの。
---

JSX の中でデータを受け取る場所（属性、DOM プロパティ、テキストの子、ライブラリが提供するコンポーネントの props）は、どれも `Bindable<T>` を受け付けます。

| `Bindable<T>` は次のどちらか | 束縛したときに起きること                                      |
| :--------------------------- | :------------------------------------------------------------ |
| `InitializedObservable<T>`   | その値で 1 回書き込み、値を変える更新があるたびに書き込み直す |
| `Constant<T>`                | 1 回書き込むだけ。ノードも束縛も作らない                      |

まだ値を持たないことがある `Observable<T>`（イベントのソースや `filter`）は `Bindable` ではありません。束縛したときに書き込むものがないからです。先に `withInitialValue(x)` で値を持たせてください。

## `constant`

素の値は `Bindable` ではありません。変わらない値は `constant(...)` で包んで、変わらないことを明示します。

```tsx
import { constant, type JSX } from 'synstate-dom-next';
import { createState } from 'synstate-next';

const [count$] = createState(0);

export const Counter = (): JSX.Element => (
    <p title={constant('A counter')}>
        {constant('Count: ')}
        {count$}
    </p>
);

// @ts-expect-error A plain string is not a Bindable: write constant('Hi').
export const Plain = (): JSX.Element => <p>{'Hi'}</p>;

// @ts-expect-error A snapshot would be written once and never updated.
export const Stale = (): JSX.Element => <p>{count$.value}</p>;
```

`constant` は引数をそのまま返すだけです。`Constant<T>` は型の上にしか存在しないので、実行時のコストはありません。`constant('button')` はリテラル型 `Constant<'button'>` を保ちます。

このルールは、上の 2 つ目のエラーのためにあります。`{count$.value}` は状態を 1 回読んで、二度と更新されない数値を書き込みます。素の値を受け付けていたら、これはコンパイルが通り、最初の更新までは正しい数値を表示してしまいます。ここではそもそもコンパイルが通りません。

データではないものは素の値を受け取ります。イベントハンドラ、`ref`、`For` と `Switch` の `key` 関数、子を返す関数です。

- `constant` は `null` と `undefined` を受け付けません。属性を出さないなら prop を省略し、ときどき無くなる値には `InitializedObservable<T | undefined>` を使ってください。
- `constant(obs$)` も型エラーです。
- `constant` が長いと感じたら、import するときに名前を変えてください：`import { constant as c } from 'synstate-dom-next'`。

## Observable を変換する: `pipe(map)`

Observable を変換して表示するには `source$.pipe(map(fn))` と書きます。束縛のための別の書き方はありません。props や属性は `map` のノードを他の Observable と同じように受け取ります。コンポーネントや `For` の行の中で作ったノードはその owner に属し、owner と一緒に破棄されます。

```tsx
import { constant, For, type JSX } from 'synstate-dom-next';
import { createState, map } from 'synstate-next';

const [count$, setCount] = createState(0);

export const Counter = (): JSX.Element => (
    <div>
        {/* A `map` node, created in the component: it lives while it is mounted. */}
        <p>{count$.pipe(map((n) => `${n} items`))}</p>
        <button
            type={constant('button')}
            disabled={count$.pipe(map((n) => n === 0))}
            onClick={() => {
                setCount(0);
            }}
        >
            {constant('Reset')}
        </button>
    </div>
);

type Item = Readonly<{ id: number; price: number }>;

const [items$] = createState<readonly Item[]>([
    { id: 1, price: 120 },
    { id: 2, price: 80 },
]);

export const PriceList = (): JSX.Element => (
    <ul>
        <For items={items$} key={(item) => item.id}>
            {/* One `map` node per row, disposed with the row. */}
            {(item$) => (
                <li>{item$.pipe(map((item) => `${item.price} yen`))}</li>
            )}
        </For>
    </ul>
);
```

`map` のノードは更新ごとに `fn` を 1 回計算し、結果が前回と `Object.is` で等しくないときだけ先へ渡します。等しい結果が出れば更新はそこで止まり、その下は訪れません。そのため束縛は、表示する内容が変わったときにだけ DOM に書き込みます。結果は普通の Observable なので、複数の束縛、`.value`、さらに別のオペレーターから読めます。`pipe` は `source$.pipe(filter(f), map(g), withInitialValue(x))` のように複数のオペレーターを一度に受け取り、結果が常に値を持つかどうかをそれらから判断します。

## `Bindable` を受け取る側: `mapBindable`、`deriveBindable`、`toObservable`

`label: Bindable<string>` を受け取るコンポーネントの中では `label.pipe(...)` を呼べません。`label` が constant かもしれないからです。その場合のためのヘルパーが 3 つあります。

| ヘルパー                    | constant を渡すと                          | Observable を渡すと                 |
| :-------------------------- | :----------------------------------------- | :---------------------------------- |
| `mapBindable(b, f)`         | `f` を 1 回適用して constant を返す        | `b.pipe(map(f))`                    |
| `deriveBindable([a, b], f)` | すべて constant なら `f` を 1 回、constant | `derive`。constant は `just` として |
| `toObservable(b)`           | `just(b)`                                  | `b` そのもの                        |

constant から派生したものは constant のままなので、画面の静的な部分はグラフに入りません。

```tsx
import {
    deriveBindable,
    mapBindable,
    toObservable,
    type Bindable,
    type JSX,
} from 'synstate-dom-next';
import { debounce, withInitialValue } from 'synstate-next';

type SearchSummaryProps = Readonly<{
    query: Bindable<string>;
    hits: Bindable<number>;
}>;

export const SearchSummary = ({
    query,
    hits,
}: SearchSummaryProps): JSX.Element => {
    // A constant `hits` gives a constant, and an observable a `map` node.
    const hitsLabel = mapBindable(hits, (n) =>
        n === 1 ? '1 hit' : `${n} hits`,
    );

    // All constants: `fn` runs once and the result is a constant.
    // Otherwise: one node, synstate-next's `derive`.
    const heading = deriveBindable([query, hits], (q, n) =>
        n === 0 ? `Nothing for "${q}"` : `Results for "${q}"`,
    );

    // Only where an observable is really needed: here, to apply an operator.
    const settledQuery = toObservable(query)
        .pipe(debounce(300))
        .pipe(withInitialValue(''));

    return (
        <header>
            <h2>{heading}</h2>
            <p>{hitsLabel}</p>
            <small>{settledQuery}</small>
        </header>
    );
};
```

`toObservable` は、オペレーターを適用するときのように本当に Observable が要る場所でだけ使ってください。Observable にした constant はグラフのノードになりますが、`mapBindable` と `deriveBindable` はそれを避けます。`just(x)` は `x` を持ち、二度と値を出しません。束縛すると 1 回書き込まれるだけです。
