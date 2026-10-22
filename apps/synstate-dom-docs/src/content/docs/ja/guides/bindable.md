---
title: Bindable
description: constant、view と、データを受け取るスロットが受け付けるもの。
---

JSX でデータを受け取る場所（属性、DOM のプロパティ、テキストの子要素、ライブラリが提供するコンポーネントの props）は、すべて `Bindable<T>` を受け付ける。

| `Bindable<T>` の種類       | 束縛したときの動作                                 |
| :------------------------- | :------------------------------------------------- |
| `InitializedObservable<T>` | 現在値を 1 回書き、以後は新しい値が来るたびに書く  |
| `Constant<T>`              | 1 回だけ書く。購読しない                           |
| `View<T>`                  | 元の Observable を購読し、値ごとに変換してから書く |

完了済みの Observable（`just(...)` など）は、定数と同じく 1 回だけ書いて購読しない。

## `constant`

素の値は `Bindable` ではない。変わらない値は `constant(...)` で包み、変わらないことを明示する。

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

`constant` は引数をそのまま返す。`Constant<T>` は型の上にしかなく、実行時のコストはない。`constant('button')` はリテラル型 `Constant<'button'>` を保つ。

この規則は上の 2 つ目のエラーのためにある。`{count$.getSnapshot().value}` は状態を 1 回読み、二度と更新されない数値を書く。素の値を受け付けると、これがコンパイルを通り、最初の更新までは正しい数値を表示してしまう。ここではコンパイルが通らない。

データでないものは素の値を受け取る。イベントハンドラ、`ref`、`For` の `key` 関数、子要素を返す関数である。

- `null` と `undefined` は `constant` が拒否する。属性がないことは props の省略で表し、あったりなかったりする値は `InitializedObservable<T | undefined>` で表す。
- `constant(obs$)` も型エラーになる。
- `constant` が長ければ import 時に名前を変える。`import { constant as c } from 'synstate-dom'`。

## `view`

`view(source$, fn)` は Observable と軽い変換の組で、`Bindable` を置けるところならどこにでも渡せる。

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

`view` は synstate のグラフにノードを作らない。束縛が `source$` を購読し、値ごとに `fn` を通してから書き込む。入力が 1 つなのでグリッチの起きようがなく、`count$.pipe(map(fn))` より短い。

`fn` は値が来るたびに、`view` を束縛した場所ごとに呼ばれる。同じ `view` を 2 か所に渡すと 2 回呼ばれ、結果は共有されない。重い変換や、複数の束縛先で使う値は `pipe(map(...))` でノードにする。

## `Bindable` を受け取る側: `mapBindable`、`derive`、`toObservable`

`label: Bindable<string>` を受け取ったコンポーネントは、`label` が定数かもしれないので `label.pipe(...)` と書けない。そのために 3 つの補助関数がある。

| 関数                | 定数のとき                             | Observable のとき                      | `View` のとき                     |
| :------------------ | :------------------------------------- | :------------------------------------- | :-------------------------------- |
| `mapBindable(b, f)` | `f` を 1 回適用して定数を返す          | `b.pipe(map(f))`                       | 関数を合成した `View`。ノードなし |
| `derive([a, b], f)` | すべて定数なら `f` を 1 回、定数を返す | 定数を `just` にして `combine` + `map` | Observable にしてから同じ         |
| `toObservable(b)`   | `just(b)`                              | `b` そのもの                           | `source.pipe(map(fn))`            |

定数から派生したものは定数のままなので、ビューの静的な部分はグラフに入らない。

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
    // A constant `hits` gives a constant, an observable a `map` node, and a
    // view a composed view.
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

`toObservable` は、operator を適用するなど Observable が本当に必要な場面に限る。定数を Observable にするとグラフに加わるが、`mapBindable` と `derive` ならそうならない。
