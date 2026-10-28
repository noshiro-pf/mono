---
title: 概要
description: synstate-dom とは何か、そしてその土台にあるモデルについて。
---

synstate-dom は、[synstate](https://noshiro-pf.github.io/mono/synstate/ja/) の Observable を DOM に直接束縛する UI ライブラリです。JSX を書いて、値を置きたい場所に Observable を渡すだけで動きます。Solid のようなコンパイラは要りませんし、仮想 DOM もありません。

:::caution
synstate-dom はまだ 0.x なので、マイナーリリースでも API が変わることがあります。設計は [`SPEC.md`](https://github.com/noshiro-pf/mono/blob/main/libs/synstate-dom/SPEC.md) にまとめてあり、このサイトは実装に追いつく形で書き足していきます。
:::

## モデル

- **コンポーネントは 1 回しか呼ばれません。** マウント時に実行されて DOM の記述を返したら、それきり二度と呼ばれません。その後に変わるのは、渡された Observable に束縛した DOM だけです。
- **更新は葉に直接届きます。** 状態が変わると、synstate がその変化をグラフ全体に 1 回の同期的でグリッチのない伝播で伝え、束縛された属性・プロパティ・テキストノードにそれぞれ直接書き込みます。差分を取ることはありません。
- **依存は値として渡します。** コンポーネントが依存するのは、渡された Observable そのものです。そのため、実行中に依存を追跡する必要もなければ、Solid のように JSX の式を遅延させるためにコンパイルする必要もありません。詳しくは[コンパイラなしで成り立つ理由](/mono/synstate-dom/ja/background/without-a-compiler/)を見てください。
- **何がリアクティブかは型を見ればわかります。** データを受け取るスロットは `Bindable<T>`、つまり初期値ありの Observable・`constant(...)`・`view(...)` のどれかを受け付けます。素の値を渡すと型エラーになるので、うっかりスナップショットを渡してしまうことがありません。詳しくは [Bindable](/mono/synstate-dom/ja/guides/bindable/) を見てください。

    Solid では、シグナルを読んだ式を渡しても固定値を渡しても props の型は同じ素の `T` です。なので、リアクティブに更新させたい値とそうでない値を型で区別できず、間違った方を型で弾くこともできません。コンポーネント本体で props を一度だけ読んだり分割代入したりすると更新は黙って止まってしまい、それに気づかせてくれるのは lint（eslint-plugin-solid の `solid/reactivity` と `solid/no-destructure`）だけです。synstate-dom では、更新されるかどうかは `Bindable` 型かどうかそのものなので、シグネチャを見ればわかりますし、`tsc` がチェックしてくれます。

- **後始末はスコープがしてくれます。** `If` / `Match` の各分岐と `For` の各行は、それぞれスコープの中でマウントされます。マウント中に作った派生と購読はそのスコープに属し、スコープと一緒に破棄されます。詳しくは[ライフサイクルとスコープ](/mono/synstate-dom/ja/guides/lifecycle/)を見てください。

## （まだ）しないこと

- サーバーサイドレンダリングとハイドレーション。
- context。部分木で必要なものは props で渡すか、ストアを import してください。
- Preact Signals や React のような、コンポーネントの再実行。

## 次に読むもの

- [インストール](/mono/synstate-dom/ja/getting-started/installation/)では、JSX の変換を設定してカウンターを描画します。
- [ベンチマーク](/mono/synstate-dom/ja/background/benchmark/)では、js-framework-benchmark の操作で Solid・Preact + Signals・Preact・React・VanJS と比べています。[バンドルサイズ](/mono/synstate-dom/ja/background/bundle-size/)では、同じアプリケーションに各ライブラリがどれだけサイズを足すかを比べています。
