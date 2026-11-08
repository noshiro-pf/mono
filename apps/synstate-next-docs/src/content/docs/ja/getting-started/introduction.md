---
title: 概要
description: synstate-next とは何か。状態・派生値・購読者を最初にひととおり見ます。
---

synstate-next は、Observable の上に作った TypeScript の状態管理ライブラリです。アプリケーションの状態を state に置き、そこから派生する値をオペレーターで宣言し、表示するものを購読します。状態が変わると、synstate-next はグリッチのない 1 回の更新ですべての派生値を最新にしてから、購読者を呼びます。

:::caution
synstate-next と synstate-dom-next はリポジトリ内の非公開パッケージで、synstate と synstate-dom の次のメジャーバージョンとして公開する予定です。npm には公開しておらず、それまでは API が変わることがあります。いま synstate を使っているなら、違いは [synstate からの変更点](/mono/synstate-next/ja/background/changes-from-synstate/)にまとめてあります。
:::

## 特徴

- **シンプルな状態を、どこからでも共有。** `createState` は状態とセッターを、`createReducer` は状態と dispatch を返します。React の `useState`・`useReducer` と同じ形で、アプリケーション全体で共有できます。それを読むパイプラインは、コンポーネントでもテストでもスクリプトでも同じように動きます。
- **非同期オペレーターを内蔵。** `debounce`・`throttle`・`switchMap`・`fromAbortablePromise` で、タイマー、取り消し、「最新の応答だけ」がパイプラインの 1 行になります。
- **グリッチがなく、コストは線形。** 更新は、届いた値を深さの順に、親がすべて済んだ後に 1 回ずつ辿ります。2 つの値から派生した値が、片方だけ更新された状態を見ることはありません。`debounce` や `switchMap` を通しても同じで、Signal のライブラリはこれらを effect として書きます。それで何を失うかは [Signals の上のオペレーター](/mono/synstate-next/ja/comparison/operators-on-signals/) を参照。
- **購読者は更新の後に呼ばれます。** 購読者が呼ばれるのは、更新が変える値すべてに届いた後なので、ほかに何を読んでも最新です（同じ更新のために先に呼ばれた購読者が状態に書き込んだ場合、その状態から派生した値だけは次の更新で追いつきます）。購読者の書き込みは、この更新を中断せず、次の更新を始めます。
- **変わらない値で更新が止まります。** 計算し直した派生値が前と同じなら何も伝えず、それに依存するものは訪れません。
- **取り消しの仕組みが組み込まれています。** `switchMap` の中で `fromAbortablePromise` を使えば新しいクエリは置き換えた前のリクエストを中断し、owner の中で始めた処理（たとえばダイアログのリクエスト・タイマー・購読）は、その owner の `dispose()` 1 回で止まります。
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
