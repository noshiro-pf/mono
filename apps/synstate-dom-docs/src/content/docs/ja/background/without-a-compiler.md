---
title: コンパイラなしで成り立つ理由
description: Solid がコンパイラを使うところで synstate-dom がコンパイラを必要としない理由と、その代わりに払っているもの。
---

<!-- cspell:ignore snabbdom Voby Leptos -->

Solid と synstate-dom の実行モデルは同じです。どちらもコンポーネントは 1 回だけ実行され、更新は DOM に直接書き込まれます。それなのに Solid はコンパイラを持ち、synstate-dom は持ちません。この違いは、何を依存の目印にしているかから来ています。

Solid では、signal を読む呼び出し `count()` が依存の目印です。この呼び出しを effect の中で何度でも実行し直せるように、JSX の式を評価せずに残しておく必要があり、コンパイラが JSX をそういう形に書き換えています。一方 synstate-dom では、依存は値、つまり Observable の `count$` です。呼び出すのではなく渡すだけなので、評価せずに残しておくものがそもそもありません。

| Solid のコンパイラがしていること                                                                                                                                                   | synstate-dom で要らない理由                                                                                                                                                         |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **式を遅延させる。** `{count()}` を `insert(el, () => count())` のように包み、effect の中で評価し直します。コンパイラなし（`solid-js/h`）では自分で `{() => count()}` と書きます。 | `count$` は渡した時点ですでに遅延しています。うっかり素の値を渡しても、コンパイラが直してくれるのではなく型エラーになります（[Bindable](/mono/synstate-dom/ja/guides/bindable/)）。 |
| **props を getter にする。** `<Comp v={count()} />` は `get v() { return count() }` になります。props を分割代入するとリアクティブでなくなるのはこのためです。                     | props は Observable そのものを持っているので、失われる getter がありません。分割代入しても大丈夫です（[コンポーネント](/mono/synstate-dom/ja/guides/components/)）。                |
| **`<Show>` などの children を遅延させて**、選ばれた分岐だけを評価します。                                                                                                          | `jsx()` は DOM ではなく記述を返すので、`If` に両方の分岐を書いても、マウントされるのは選ばれた側だけです（[制御構文](/mono/synstate-dom/ja/guides/control-flow/)）。                |
| **静的な部分を最適化する。** 静的な HTML を `<template>` に抜き出して複製し、属性・プロパティ・イベントの区別もコンパイル時に決めます。                                            | 静的かどうかは実行時に決めます。`Constant` と完了済みの Observable は 1 回書くだけで購読しません。属性とプロパティの区別は表で持っています。                                        |

Solid 側の説明は、Solid の JSX を変換する [babel-plugin-jsx-dom-expressions](https://github.com/ryansolid/dom-expressions/blob/main/packages/babel-plugin-jsx-dom-expressions/README.md) と、[`solid-js/h`](https://github.com/solidjs/solid/blob/main/packages/solid/h/README.md)・[`solid-js/html`](https://github.com/solidjs/solid/blob/main/packages/solid/html/README.md) の README で確認しました。

## 代わりに払っているもの

- **テンプレートを複製しません。** 要素は 1 つずつ `createElement` で作ります。そのため多くの行を作るときは Solid より時間がかかります。どのくらいかかるかは[ベンチマーク](/mono/synstate-dom/ja/background/benchmark/)を見てください。
- **書く量が増えます。** `count() * 2` のような式をその場に書けないので、`view(count$, (n) => n * 2)` や `count$.pipe(map(...))` と書きますし、固定の文字列も `constant('...')` と書きます。その代わり、何がリアクティブかが型に表れます。

## 先行例

- **Solid**（`createRoot`、owner、`<For>`、`runWithOwner`）：実行モデルとスコープの使い方がいちばん近いライブラリです。違うのは、依存を自動で追跡することと、`T | Accessor<T>` を受け付けることです。
- **Vue 3 の `effectScope`**：`run`・`getCurrentScope`・`onScopeDispose` という API も、その実装も同じです。
- **Cycle.js**：一度だけ呼んで配線することと、依存が明示的なことが同じです。DOM への出力は `Stream<VNode>` で、差分は snabbdom が取ります。
- **VanJS、Voby、Sinuous、`solid-js/h`**：コンパイラなしで細粒度の更新を実現しています。ただし、synstate-dom が `Bindable` を要求するところで、どれも素の値を受け付けます。
- **Leptos**（Rust）：props を `Signal<T>` と型で書くところが `Bindable<T>` に近いです。
