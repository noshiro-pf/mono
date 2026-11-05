---
title: Bindable
description: constant と inlineMap、そしてデータを受け取るスロットに何を渡せるか。
---

JSX でデータを受け取る場所（属性、DOM のプロパティ、テキストの子要素、ライブラリが提供するコンポーネントの props）は、どれも `Bindable<T>` を受け付けます。

| `Bindable<T>` の種類       | 束縛したときの動き                                  |
| :------------------------- | :-------------------------------------------------- |
| `InitializedObservable<T>` | 現在値を 1 回書き、その後は新しい値が来るたびに書く |
| `Constant<T>`              | 1 回だけ書いて、購読はしない                        |

完了済みの Observable（`just(...)` など）も、定数と同じく 1 回だけ書いて購読はしません。

組み込み要素のスロット（属性、DOM のプロパティ、テキストの子要素、`class` や `style` のオブジェクトの値）は、後で説明する最適化の `inlineMap(...)` も受け付けます。その型は `ElementBindable<T>` です。`Bindable` 型の props と、`Bindable` を受け取る補助関数には渡りません。コンポーネントが要素にそのまま渡す props（`Child` や、`Link` がアンカーに展開する `<a>` の属性など）は含むことがあります。

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

## Observable を変換する: `pipe(map)`、束縛が多い所では `inlineMap`

Observable を変換して表示するには `source$.pipe(map(fn))` と書きます。コンポーネントの中で作った `map` のノードはそのコンポーネントのスコープに属し、一緒に破棄されます。行ごとに束縛が増える `For` の行では、`inlineMap(source$, fn)` を要素のスロットに直接渡せば、同じことがノードなしでできます。

```tsx
import { createState, map } from 'synstate';
import { constant, For, inlineMap, type JSX } from 'synstate-dom';

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
            {/* A binding in every row: `inlineMap` saves a node in each. */}
            {(item$) => (
                <li>{inlineMap(item$, (item) => `${item.price} yen`)}</li>
            )}
        </For>
    </ul>
);
```

`inlineMap` は `pipe(map)` の最適化で、名前もそれを表しています。synstate のグラフにノードを作らず、束縛が `source$` を直接購読し、値が来るたびに `fn` を通して書き込みます。前回書いた結果と `Object.is` で等しければ書きません。これは `map` のノードが下流に流す値と同じです。1 行に 4 つずつ束縛がある 1,000 行の `For` では、マウントが約 5%、全行の更新が約 15%、破棄が約 35% 速くなります。束縛が数個なら差は測れないほど小さいです。

代わりに失うのは、結果の共有と、Observable であることです。受け付けるのは要素のスロットと、`Child` のように要素にそのまま渡される props だけで、`Bindable` 型の props（`If` の `cond` や `For` の `items` も含む）には渡せず、`pipe` も `subscribe` もありません。`map` のノードは更新 1 回につき `fn` を 1 回だけ計算して結果を保持し、すべての束縛、`getSnapshot()`、operator がその結果を読みます。`inlineMap` は何も保持しないので、2 か所に渡せば `fn` は 2 回呼ばれ、結果を他から読むこともできません。重い変換や、複数の場所で使う値はノードのままにしましょう。

この形があるのは `map` だけです。入力が複数ある変換（`deriveBindable`）は、更新が全部の入力に届いた後に計算するためにノードが必要です。購読者は伝播の途中で呼ばれるので、1 つの入力の購読者からは、他の入力がまだ更新前に見えてしまいます。状態を持つ operator（`scan`）は、状態が束縛ごとにできてしまいます。

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
