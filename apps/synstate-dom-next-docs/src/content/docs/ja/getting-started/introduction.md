---
title: 概要
description: synstate-dom-next とは何か、そしてその土台にあるモデルについて。
---

synstate-dom-next は、[synstate-next](https://github.com/noshiro-pf/mono/tree/main/libs/synstate-next) の Observable を DOM に直接束縛する UI ライブラリです。JSX を書いて、値を置きたい場所に Observable を渡すだけで動きます。Solid と同じくコンポーネントは 1 回しか実行されず、更新は DOM に直接書き込まれますが、Solid と違ってコンパイラは要りません。仮想 DOM もありません。

:::caution
synstate-dom-next と synstate-next は、synstate-dom と synstate をゼロから作り直したもので、次のメジャーバージョンで今のものを置き換えるまで、リポジトリ内の非公開パッケージとして置いています。npm には公開しておらず、それまでは API が変わることがあります。synstate-dom から変わった点は [synstate-dom からの変更点](/mono/synstate-dom-next/ja/background/changes-from-synstate-dom/)にまとめてあります。
:::

## synstate-dom-next を使う理由

synstate-dom-next は、次世代の SynState のための UI ライブラリです。synstate-next のランタイムに UI としてできるかぎり直接つながるように作っています。束縛は、クロージャを包んだ購読者ではなくグラフの葉そのもので、DOM ノードを自分のフィールドに持つ effect です。synstate-next のオペレーターで組んだグラフは、それを束縛したノードで終わります。

- **シンプルな API で、遅くなる場面が少ない。** 1 つのことに書き方は 1 つです。変換した値はどこに束縛するときも `source$.pipe(map(fn))`、選択は `If`・`MatchOptional`・`MatchResult`・`Switch`、リストは `For` です。js-framework-benchmark の操作では、synstate-dom-next の時間は synstate-dom の <!-- benchmark:next-over-dom-min -->0.78<!-- /benchmark --> 倍から <!-- benchmark:next-over-dom-max -->1.00<!-- /benchmark --> 倍で、Solid に対しても最大 <!-- benchmark:next-over-solid-max -->1.31<!-- /benchmark --> 倍です。詳しくは[ベンチマーク](/mono/synstate-dom-next/ja/background/benchmark/)を見てください。
- **束縛は更新が落ち着いてから動きます。** 更新はグラフ全体に伝わり終わってから、束縛が実行されます。束縛が更新途中のグラフを見ることはなく、分岐を外す switch は、その分岐の派生が外れる値で計算してしまう前に外すと決めます。詳しくは[仕組み](/mono/synstate-dom-next/ja/background/how-it-works/)を見てください。

## モデル

- **コンポーネントは 1 回しか呼ばれません。** マウント時に実行されて DOM の記述を返したら、それきり二度と呼ばれません。その後に変わるのは、渡された Observable に束縛した DOM だけです。
- **更新は葉に直接届きます。** 状態が変わると、synstate-next がその変化をグリッチのない 1 回の伝播でグラフに伝え、各ノードを、親がすべて済んだ後に 1 回だけ計算します。その後、更新が届いた束縛がそれぞれ属性・プロパティ・テキストノードに書き込みます。差分を取ることはありません。
- **依存は値として渡します。** コンポーネントが依存するのは、渡された Observable そのものです。そのため、実行中に依存を追跡する必要もなければ、Solid のように JSX の式を遅延させるためにコンパイルする必要もありません。詳しくは[コンパイラなしで成り立つ理由](/mono/synstate-dom-next/ja/background/without-a-compiler/)を見てください。
- **何がリアクティブかは型を見ればわかります。** データを受け取るスロットは `Bindable<T>`、つまり値を持つ Observable か `constant(...)` を受け付けます。素の値を渡すと型エラーになるので、うっかりスナップショットを渡してしまうことがありません。詳しくは [Bindable](/mono/synstate-dom-next/ja/guides/bindable/) を見てください。

    Solid では、シグナルを読んだ式を渡しても固定値を渡しても props の型は同じ素の `T` なので、間違った方を型で弾けません。コンポーネント本体で props を一度だけ読んだり分割代入したりすると更新は黙って止まり、それに気づかせてくれるのは lint（eslint-plugin-solid の `solid/reactivity` と `solid/no-destructure`）だけです。ここでは、更新されるかどうかは `Bindable` 型かどうかそのものなので、シグネチャを見ればわかりますし、`tsc` がチェックします。

    props は値を読み出したものではなく `Bindable` そのものなので、特別な扱いは要りません。分割代入しても、デフォルト値を付けても、残りをまとめて渡しても、コンポーネント本体で計算しても構いません。その代わり、更新し続けたい派生値は JSX の中の式ではなく、Bindable として（`mapBindable` や `deriveBindable` で）組み立てます。詳しくは [props は普通の JavaScript の値](/mono/synstate-dom-next/ja/guides/components/#props-は普通の-javascript-の値)を見てください。

- **後始末は owner がしてくれます。** owner の実行中に作ったもの（派生・束縛・購読）は、すべてその owner に属します。`render` がルートの owner を作り、switch の各分岐と `For` の各行はそれぞれ専用の owner の中でマウントされ、分岐や行が消えるときに破棄されます。詳しくは[ライフサイクルと owner](/mono/synstate-dom-next/ja/guides/lifecycle/)を見てください。

## まだできないこと

- サーバーサイドレンダリングやハイドレーションはありません。
- コンテキストはありません。部分木が必要とするものは props で渡すか、ストアを import してください。
- Preact Signals や React のようにコンポーネントを再実行することはありません。

## 次に読むもの

- [インストール](/mono/synstate-dom-next/ja/getting-started/installation/)では、JSX の変換を設定してカウンターを描画します。
- [仕組み](/mono/synstate-dom-next/ja/background/how-it-works/)では、書き込みから DOM までの更新の流れを追い、作り直しが synstate-dom より速い理由を説明します。
- [ベンチマーク](/mono/synstate-dom-next/ja/background/benchmark/)では、js-framework-benchmark の操作と 3 つのシナリオで synstate-dom-next を synstate-dom・Solid と比べ、[バンドルサイズ](/mono/synstate-dom-next/ja/background/bundle-size/)では、同じアプリケーションにそれぞれがどれだけのサイズを足すかを比べます。
