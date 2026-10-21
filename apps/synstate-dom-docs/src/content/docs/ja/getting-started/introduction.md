---
title: 概要
description: synstate-dom とは何か、その土台となるモデル。
---

synstate-dom は、[synstate](https://noshiro-pf.github.io/mono/synstate/ja/) の Observable を DOM に直接束縛する UI ライブラリである。JSX を書き、値を置く場所に Observable を渡す。コンパイラも仮想 DOM もない。

:::caution
synstate-dom は開発中で、まだ npm に公開していない。設計は [`SPEC.md`](https://github.com/noshiro-pf/mono/blob/main/libs/synstate-dom/SPEC.md) にあり、このサイトは実装に合わせて書き足していく。
:::

## モデル

- **コンポーネントは 1 回だけ呼ばれる。** マウント時に実行されて DOM の記述を返し、二度と呼ばれない。後から変わるのは、渡された Observable に束縛された DOM だけである。
- **更新は葉に届く。** 状態が変わると synstate がグラフの中を 1 回の同期的でグリッチのない伝播で伝え、束縛された属性・プロパティ・テキストノードにそれぞれ直接書き込む。差分は取らない。
- **依存は値である。** コンポーネントが依存するのは渡された Observable なので、実行中に依存を追跡する必要も、JSX の式を遅延させるためにコンパイルする必要もない。[コンパイラなしで成り立つ理由](/mono/synstate-dom/ja/background/without-a-compiler/)を参照。
- **何がリアクティブかを型が示す。** データを受け取るスロットは `Bindable<T>`、つまり初期値ありの Observable・`constant(...)`・`view(...)` のどれかを受け付ける。素の値は型エラーなので、スナップショットを誤って渡せない。[Bindable](/mono/synstate-dom/ja/guides/bindable/)を参照。
- **スコープが後始末をする。** `If` / `Match` の各分岐と `For` の各行はスコープの中でマウントされる。マウント中に作られた派生と購読はそのスコープに属し、スコープとともに破棄される。[ライフサイクルとスコープ](/mono/synstate-dom/ja/guides/lifecycle/)を参照。

## （まだ）しないこと

- サーバーサイドレンダリングとハイドレーション。
- context。部分木が必要とするものは props で渡すか、ストアを import する。
- Preact Signals や React のようなコンポーネントの再実行。

## 次に読むもの

- [インストール](/mono/synstate-dom/ja/getting-started/installation/)で JSX の変換を設定し、カウンターを描画する。
- [ベンチマーク](/mono/synstate-dom/ja/background/benchmark/)では、js-framework-benchmark の操作で Solid・Preact + Signals・Preact・React・VanJS と比べている。
