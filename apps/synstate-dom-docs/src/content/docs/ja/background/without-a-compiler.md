---
title: コンパイラなしで成り立つ理由
description: Solid がコンパイラを使うところで synstate-dom がそれを要しない理由と、その代償。
---

<!-- cspell:ignore snabbdom Voby Leptos -->

Solid と synstate-dom の実行モデルは同じで、コンポーネントは 1 回だけ実行され、更新は DOM に直接書き込まれる。Solid はコンパイラを持ち、synstate-dom は持たない。違いは、何を依存の印にするかから来る。

Solid では、signal を読む呼び出し `count()` が依存の印である。その呼び出しを effect の中で再実行できるよう JSX の式を評価せずに残しておく必要があり、コンパイラが JSX をそのように書き換える。synstate-dom では依存は値、つまり Observable の `count$` で、呼び出すのではなく渡すので、評価せずに残しておくものがない。

| Solid のコンパイラがしていること                                                                                                                                             | synstate-dom で不要な理由                                                                                                                                            |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **式を遅延させる。** `{count()}` を `insert(el, () => count())` のように包み、effect の中で再評価する。コンパイラなし（`solid-js/h`）では利用者が `{() => count()}` と書く。 | `count$` は渡した時点で遅延済みである。素の値を誤って渡すことは、コンパイラが直すのではなく型エラーになる（[Bindable](/mono/synstate-dom/ja/guides/bindable/)）。    |
| **props を getter にする。** `<Comp v={count()} />` は `get v() { return count() }` になる。props を分割代入するとリアクティブでなくなるのはこのため。                       | props は Observable そのものを持つので失われる getter がなく、分割代入しても安全である（[コンポーネント](/mono/synstate-dom/ja/guides/components/)）。               |
| **`<Show>` などの children を遅延させ**、選ばれた分岐だけを評価する。                                                                                                        | `jsx()` は DOM ではなく記述を返すので、`If` の両方の分岐を書いてもマウントされるのは選ばれた側だけである（[制御構文](/mono/synstate-dom/ja/guides/control-flow/)）。 |
| **静的な部分を最適化する。** 静的な HTML を `<template>` に抜き出して複製し、属性・プロパティ・イベントの区別もコンパイル時に決める。                                        | 静的かどうかは実行時に決める。`Constant` と完了済みの Observable は 1 回書くだけで購読しない。属性とプロパティの区別は表で持つ。                                     |

Solid 側の記述は、Solid の JSX を変換する [babel-plugin-jsx-dom-expressions](https://github.com/ryansolid/dom-expressions/blob/main/packages/babel-plugin-jsx-dom-expressions/README.md) と、[`solid-js/h`](https://github.com/solidjs/solid/blob/main/packages/solid/h/README.md)・[`solid-js/html`](https://github.com/solidjs/solid/blob/main/packages/solid/html/README.md) の README で確かめた。

## 代償

- **テンプレートを複製しない。** 要素はそれぞれ `createElement` で作る。多くの行を作るときは Solid より時間がかかり、どれだけかかるかは[ベンチマーク](/mono/synstate-dom/ja/background/benchmark/)にある。
- **書く量が増える。** `count() * 2` のような式をその場に書けず、`view(count$, (n) => n * 2)` や `count$.pipe(map(...))` と書き、固定の文字列は `constant('...')` と書く。その代わり、何がリアクティブかが型に表れる。

## 先行例

- **Solid**（`createRoot`、owner、`<For>`、`runWithOwner`）: 実行モデルとスコープの使い方が最も近い。依存を自動で追跡し、`T | Accessor<T>` を受け付ける点が異なる。
- **Vue 3 の `effectScope`**: `run`・`getCurrentScope`・`onScopeDispose` の API と、その実装が同じ。
- **Cycle.js**: 一度だけ呼んで配線し、依存が明示的である点が同じ。DOM への出力は `Stream<VNode>` で、snabbdom が差分を取る。
- **VanJS、Voby、Sinuous、`solid-js/h`**: コンパイラなしで細粒度の更新を実現しているが、どれも synstate-dom が `Bindable` を要求するところで素の値を受け付ける。
- **Leptos**（Rust）: props を `Signal<T>` と型で書く点が `Bindable<T>` に近い。
