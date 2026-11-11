---
title: Bindable
description: constant と pipe(map)、そしてデータを受け取るスロットに何を渡せるか。
---

JSX でデータを受け取る場所（属性、DOM のプロパティ、テキストの子要素、ライブラリが提供するコンポーネントの props）は、どれも `Bindable<T>` を受け付けます。

| `Bindable<T>` の種類       | 束縛したときの動き                                  |
| :------------------------- | :-------------------------------------------------- |
| `InitializedObservable<T>` | 現在値を 1 回書き、その後は新しい値が来るたびに書く |
| `Constant<T>`              | 1 回だけ書いて、購読はしない                        |

完了済みの Observable（`just(...)` など）も、定数と同じく 1 回だけ書いて購読はしません。

## `constant`

素の値は `Bindable` ではありません。変わらない値は `constant(...)` で包んで、変わらないことをはっきり書きます。

```tsx
import { createState } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';

const [count$] = createState(0);

export const Counter = (): JSX.Element => (
    <p title={constant('A counter')}>
        {constant('Count: ')}
        {count$}
    </p>
);

// @ts-expect-error A plain string is not a Bindable: write constant('Hi').
export const Plain = (): JSX.Element => <p>{'Hi'}</p>;

export const Stale = (): JSX.Element => {
    const count = Optional.unwrap(count$.getSnapshot());

    // @ts-expect-error A snapshot would be written once and never updated.
    return <p>{count}</p>;
};
```

`constant` は引数をそのまま返すだけです。`Constant<T>` は型の上にしか存在しないので、実行時のコストはかかりません。`constant('button')` と書けば、リテラル型 `Constant<'button'>` もそのまま保たれます。

このルールがあるのは、上の 2 つ目のエラーを防ぐためです。`Optional.unwrap(count$.getSnapshot())` で 1 回だけ読んだ `count` は、二度と更新されない数値を書き込みます。素の値を受け付けてしまうと、これがコンパイルを通り、最初の更新までは正しい数値が表示されるので気づきにくくなります。synstate-dom ではこれがコンパイルエラーになります。

データでないものは素の値で渡します。イベントハンドラ、`ref`、`For` の `key` 関数、子要素を返す関数がそうです。

- `null` と `undefined` は `constant` に渡せません。属性がないことは props を省略して表し、あったりなかったりする値は `InitializedObservable<T | undefined>` で表します。
- `constant(obs$)` も型エラーになります。
- `constant` が長いと感じたら、import するときに名前を変えてください：`import { constant as c } from 'synstate-dom'`。

## Observable を変換する: `pipe(map)`

Observable を変換して表示するには `source$.pipe(map(fn))` と書きます。束縛のための別の書き方はなく、スロットは `map` のノードをほかの Observable と同じように受け取ります。コンポーネントの中や `For` の行の中で作ったノードはそのスコープに属し、一緒に破棄されます。

```tsx
import { createState, map } from 'synstate';
import { constant, For, type JSX } from 'synstate-dom';

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

`map` のノードは更新 1 回につき `fn` を 1 回だけ計算し、前回と `Object.is` で等しくない結果だけを下流に流すので、束縛が DOM に書くのは表示が変わったときだけです。結果はほかと同じ Observable なので、複数の束縛、`getSnapshot()`、さらに続く operator がすべて読めます。

## `Bindable` を受け取る側: `mapBindable`、`deriveBindable`、`toObservable`

`label: Bindable<string>` を受け取ったコンポーネントでは、`label` が定数かもしれないので `label.pipe(...)` とは書けません。そのために次の 3 つの補助関数を用意しています。

| 関数                        | 定数のとき                                   | Observable のとき             |
| :-------------------------- | :------------------------------------------- | :---------------------------- |
| `mapBindable(b, f)`         | `f` を 1 回適用して定数を返す                | `b.pipe(map(f))`              |
| `deriveBindable([a, b], f)` | すべて定数なら `f` を 1 回適用して定数を返す | 定数を `just` にして `derive` |
| `toObservable(b)`           | `just(b)`                                    | `b` そのもの                  |

定数から派生したものは定数のままなので、ビューの静的な部分がグラフに入ることはありません。

```tsx
import { debounce, withInitialValue } from 'synstate';
import {
    deriveBindable,
    mapBindable,
    toObservable,
    type Bindable,
    type JSX,
} from 'synstate-dom';

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
    // Otherwise: one node, synstate's `derive`.
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

`toObservable` を使うのは、operator を適用したいときなど、本当に Observable が必要な場面だけにしてください。定数を Observable にするとグラフに加わってしまいますが、`mapBindable` と `deriveBindable` ならそうなりません。
