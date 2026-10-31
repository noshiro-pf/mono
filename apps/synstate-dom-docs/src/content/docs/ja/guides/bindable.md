---
title: Bindable
description: constant と view、そしてデータを受け取るスロットに何を渡せるか。
---

JSX でデータを受け取る場所（属性、DOM のプロパティ、テキストの子要素、ライブラリが提供するコンポーネントの props）は、どれも `Bindable<T>` を受け付けます。

| `Bindable<T>` の種類       | 束縛したときの動き                                  |
| :------------------------- | :-------------------------------------------------- |
| `InitializedObservable<T>` | 現在値を 1 回書き、その後は新しい値が来るたびに書く |
| `Constant<T>`              | 1 回だけ書いて、購読はしない                        |
| `View<T>`                  | 元の Observable を購読し、値ごとに変換してから書く  |

完了済みの Observable（`just(...)` など）も、定数と同じく 1 回だけ書いて購読はしません。

## `constant`

素の値は `Bindable` ではありません。変わらない値は `constant(...)` で包んで、変わらないことをはっきり書きます。

```tsx
import { createState } from 'synstate';
import { constant, type JSX } from 'synstate-dom';

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
export const Stale = (): JSX.Element => <p>{count$.getSnapshot().value}</p>;
```

`constant` は引数をそのまま返すだけです。`Constant<T>` は型の上にしか存在しないので、実行時のコストはかかりません。`constant('button')` と書けば、リテラル型 `Constant<'button'>` もそのまま保たれます。

このルールがあるのは、上の 2 つ目のエラーを防ぐためです。`{count$.getSnapshot().value}` は状態を 1 回読むだけなので、二度と更新されない数値を書き込みます。素の値を受け付けてしまうと、これがコンパイルを通り、最初の更新までは正しい数値が表示されるので気づきにくくなります。synstate-dom ではこれがコンパイルエラーになります。

データでないものは素の値で渡します。イベントハンドラ、`ref`、`For` の `key` 関数、子要素を返す関数がそうです。

- `null` と `undefined` は `constant` に渡せません。属性がないことは props を省略して表し、あったりなかったりする値は `InitializedObservable<T | undefined>` で表します。
- `constant(obs$)` も型エラーになります。
- `constant` が長いと感じたら、import するときに名前を変えてください：`import { constant as c } from 'synstate-dom'`。

## `view`

`view(source$, fn)` は、Observable と軽い変換をひとまとめにしたものです。`Bindable` を置ける場所ならどこにでも渡せます。

```tsx
import { createState } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';

const [count$, setCount] = createState(0);

export const Counter = (): JSX.Element => (
    <div>
        {/* `view` transforms in the subscriber: no node joins the graph. */}
        <p>{view(count$, (n) => `${n} items`)}</p>
        <button
            type={constant('button')}
            disabled={view(count$, (n) => n === 0)}
            onClick={() => {
                setCount(0);
            }}
        >
            {constant('Reset')}
        </button>
    </div>
);
```

`view` は synstate のグラフにノードを作りません。束縛が `source$` を購読し、値が来るたびに `fn` を通してから書き込みます。入力が 1 つしかないのでグリッチが起きようがなく、`count$.pipe(map(fn))` と書くより短く済みます。

`fn` は値が来るたびに、`view` を束縛した場所ごとに呼ばれます。同じ `view` を 2 か所に渡せば 2 回呼ばれ、結果は共有されません。重い変換や、複数の場所で使う値は `pipe(map(...))` でノードにしましょう。

## `Bindable` を受け取る側: `mapBindable`、`derive`、`toObservable`

`label: Bindable<string>` を受け取ったコンポーネントでは、`label` が定数かもしれないので `label.pipe(...)` とは書けません。そのために次の 3 つの補助関数を用意しています。

| 関数                | 定数のとき                                   | Observable のとき                      | `View` のとき                           |
| :------------------ | :------------------------------------------- | :------------------------------------- | :-------------------------------------- |
| `mapBindable(b, f)` | `f` を 1 回適用して定数を返す                | `b.pipe(map(f))`                       | 関数を合成した `View`。ノードは作らない |
| `derive([a, b], f)` | すべて定数なら `f` を 1 回適用して定数を返す | 定数を `just` にして `combine` + `map` | Observable にしてから同じ               |
| `toObservable(b)`   | `just(b)`                                    | `b` そのもの                           | `source.pipe(map(fn))`                  |

定数から派生したものは定数のままなので、ビューの静的な部分がグラフに入ることはありません。

```tsx
import { debounce, withInitialValue } from 'synstate';
import {
    derive,
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
    // A constant `hits` gives a constant, an observable a `map` node, and a view
    // a composed view.
    const hitsLabel = mapBindable(hits, (n) =>
        n === 1 ? '1 hit' : `${n} hits`,
    );

    // All constants: `fn` runs once and the result is a constant.
    // Otherwise: `combine` and `map`.
    const heading = derive([query, hits], (q, n) =>
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

`toObservable` を使うのは、operator を適用したいときなど、本当に Observable が必要な場面だけにしてください。定数を Observable にするとグラフに加わってしまいますが、`mapBindable` と `derive` ならそうなりません。
