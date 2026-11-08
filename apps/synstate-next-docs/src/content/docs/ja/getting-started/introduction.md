---
title: 概要
description: synstate-next とは何か。状態・派生値・購読者を最初にひととおり見ます。
---

synstate-next は、Observable の上に作った TypeScript の状態管理ライブラリです。アプリケーションの状態を state に置き、そこから派生する値をオペレーターで宣言し、表示するものを購読します。状態が変わると、synstate-next はグリッチのない 1 回の更新ですべての派生値を最新にしてから、購読者を呼びます。

:::caution
synstate-next と synstate-dom-next は、synstate と synstate-dom をゼロから作り直したもので、次のメジャーバージョンで今のものを置き換えるまで、リポジトリ内の非公開パッケージとして置いています。npm には公開しておらず、それまでは API が変わることがあります。synstate から変わった点は [synstate からの変更点](/mono/synstate-next/ja/background/changes-from-synstate/)にまとめてあります。
:::

## 特徴

- **グリッチがなく、コストは線形。** 更新は、届いたノードを深さの順に、親がすべて済んだ後に 1 回ずつ辿ります。2 つの値から派生した値が、片方だけ更新された状態を見ることはありません。
- **購読者は落ち着いたグラフの上で実行されます。** 購読者が呼ばれるのは更新がすべてのノードに届いた後で、途中ではありません。購読者が行った書き込みは次の更新を始め、ドレイン中に行った書き込みはそのラウンドが終わるまで待ちます。
- **既定で等値打ち切り。** 派生値を計算し直した結果がすでに持っている値と等しければ、何も伝えません。その下は辿られません。
- **完了の代わりに owner。** owner の実行中に作ったものはすべてその owner に属し、owner を破棄すればまとめて破棄されます。送り忘れる `complete` はありません。
- **値があるかどうかを型が示します。** `InitializedObservable<A>` は常に値を持ち `.value` があります。`Observable<A>` はまだ値を持たないことがあります。オペレーターをつないだ結果がどちらになるかは `pipe` が計算します。

## 簡単な例

:::note
このサイトの例はどれも、テストで実行しているファイルです。`assert` と `vi` は Vitest のもので、コードが何をするかを示すために置いています。`fetchUser` のような補助関数は読者自身のコードの代わりで、何をするかはコメントに書いてあります。
:::

`createState` は、状態とそのセッター、それ以外の操作をまとめたものを返します。

```tsx
import { createState } from 'synstate-next';

const [count, setCount, { updateState }] = createState(0);

const mut_seen: number[] = [];

// Called at once with the value held, then after every update.
count.subscribe((value) => {
    mut_seen.push(value);
});

setCount(1);

updateState((n) => n + 1);

assert.deepStrictEqual(mut_seen, [0, 1, 2]);

assert.strictEqual(count.value, 2);
```

`subscribe` は、関数をまず今の値で呼び、その後は値が変わる更新のたびに呼びます。`setCount` が戻った時点で更新は終わっています。synstate-next は同期的で、アプリケーションの非同期な部分は非同期オペレーターと非同期ソース（`debounce`・`fromPromise`・`timer` など）からだけ生まれます。

## `pipe` で値を派生させる

`pipe` はオペレーターを順に適用します。各オペレーターは、最初に持っている値を保つ（`map`）、落とすことがある（`filter`）、必ず値を用意する（`scan`・`withInitialValue`）のどれなのかを型で示すので、結果の型を見れば `.value` を読めるのか、`hasValue` を確かめる必要があるのかがわかります。

```tsx
import {
    createState,
    filter,
    map,
    type InitializedObservable,
    type Observable,
} from 'synstate-next';
import { expectType } from 'ts-data-forge';

const [count, setCount] = createState(1);

// `map` keeps the value held at the start: the result always holds one.
const doubled = count.pipe(map((n) => n * 2));

expectType<typeof doubled, InitializedObservable<number>>('=');

// `filter` may drop it: the result may hold none.
const even = count.pipe(filter((n) => n % 2 === 0));

expectType<typeof even, Observable<number>>('=');

assert.strictEqual(doubled.value, 2);

assert.isFalse(even.hasValue);

setCount(4);

assert.strictEqual(doubled.value, 8);

assert.strictEqual(even.peek(), 4);
```

## 次に読むもの

- [インストール](/mono/synstate-next/ja/getting-started/installation/)では、リポジトリ内のパッケージに synstate-next を追加します。
- [synstate-next を使う理由](/mono/synstate-next/ja/guides/why-synstate-next/)では設計から得られるものを説明し、[宣言的な状態管理](/mono/synstate-next/ja/guides/declarative-state/)ではそれをフィルター付きのデータテーブルで示します。
- [更新の伝わり方](/mono/synstate-next/ja/internals/how-an-update-propagates/)では、書き込みから購読者までの更新の流れを追います。
