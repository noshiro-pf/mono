---
title: 先行事例と設計の根拠
description: synstate-next の考え方の出どころ。静的スケジューリング、高さ順の伝播、安定化番号、owner。そしてグラフを静的に保つ理由。
---

<!-- cspell:ignore Krishnamurthi Czaplicki Chong Maier Bainomugisha stabilizations ESOP PLDI -->

synstate-next は synstate の中心となる考え方を引き継ぎ、その実現方法を変えました。このページでは、その両方を文脈の中に置きます。

## 中心となる考え方

> グラフは静的です。ノードの親は作られたときに決まるので、その深さ、つまり更新の中での順番は 1 回計算すれば済みます。そうすると更新に必要なのは優先度付きキューではなく深さごとのバケットで、届いたノードをそれぞれ、親がすべて済んだ後に 1 回だけ辿ります。

どれも新しい考え方ではありません。静的スケジューリング、グリッチを避けるためのトポロジカル順序、静的なグラフなら順序を 1 回で計算できるという観察は、どれも以前に述べられており、最も古いものは 1987 年です。

## 文献にある先行事例

- **データフローグラフの静的スケジューリング。** Lee と Messerschmitt の _Static Scheduling of Synchronous Data Flow Programs_（1987）は、流量が前もってわかっているデータフローグラフを、コンパイル時に 1 回だけスケジュールし、「実行時のオーバーヘッドは消える」としています。Observable の静的なグラフも同じ状況です。
- **グリッチを避けるトポロジカル順序。** FrTime（Cooper と Krishnamurthi、2006）は各ノードに依存先より大きな高さを与え、高さ順の優先度付きキューで伝播します。グラフが動的なので、グラフが変わると高さを計算し直します。Elm の初期の FRP（Czaplicki と Chong、2013）は、シグナルグラフを起動時に固定されるものに制限していました。Scala.React（Maier と Odersky、2012）は、トポロジカル順序で 2 段階に伝播します。
- **サーベイ。** Bainomugisha らの _A Survey on Reactive Programming_（2013）は静的な依存グラフと動的な依存グラフを区別し、「式をトポロジカルソートし、トポロジカル順に値を更新する」ことをグリッチをなくす標準的な手法として挙げています。

## 作り直しが加えたものと、その出どころ

| synstate-next                 | synstate で置き換えたもの              | 先行事例                                                                            |
| :---------------------------- | :------------------------------------- | :---------------------------------------------------------------------------------- |
| 更新は 1 つの番号             | 書き込みごとの更新トークンオブジェクト | Jane Street の Incremental は安定化に番号を振り、各ノードにいつ変わったかを記録する |
| effect は値の再計算の後に実行 | 伝播の途中で呼ばれる購読者             | Solid や Preact Signals の effect キュー。更新の後に effect を実行する              |
| 再計算中の書き込みは遅らせる  | 自前のバケットを持つ入れ子の更新       | 同じライブラリが、更新中の書き込みをまとめる仕組み                                  |
| 寿命は owner だけ             | スコープと完了と参照カウント           | Solid の owner ツリー（`createRoot`・`getOwner`・`onCleanup`）                      |
| `settled` を使う場所で尋ねる  | グラフを下る完了                       | 特になし。完了が答えていた問いを、答えを使う場所でだけ尋ねる                        |

## グラフを静的に保つ理由

UI 向けのリアクティブライブラリの多く（Angular Signals・Preact Signals・Solid・MobX・Vue・Jotai）は、計算の実行中に依存を追跡するので、値が何に依存するかが実行ごとに変わりえます。synstate-next は、synstate と同じ理由で静的なグラフを保ちます。

- **条件付きの依存は値で表せます。** すべての分岐に対する `derive` が有効な分岐を返すなら、無効な分岐への書き込みでは計算しても同じ値になります。関数 1 回と比較 1 回のコストで、値が変わらないので、更新はそこで止まります。それでも多すぎるなら、`switchMap` は選ばれた分岐だけを追い、選択が変わると内側の Observable を置き換えます。
- **コレクションは 1 つの Observable です。** リストを 1 つの状態に持ち、項目ごとに派生 Observable（項目への `map`、変わらなければそこで止まる）を作れば、変わったものだけが更新されます。synstate-dom-next の `For` が行ごとに状態を持つのも同じ理由です。
- **非同期のデータは `switchMap` です。** 値に依存するリクエストはその値から射影し、射影を破棄すればリクエストは中断されます。リクエストの寿命がコードに書いてあります。
- **依存がコードに書いてあります。** `derive([a, b], fn)` は何を読むかを示します。React の `useMemo` の依存配列と同じで、`fn` の中の読み取りがうっかり依存を増やすことはありません。

静的なグラフのコストは、値が今は読んでいない分岐への購読です。動的な追跡はそれを避けますが、その代わりに実行のたびに依存集合を最新に保つコストを払います。

## 参考文献

- Lee, E.A. & Messerschmitt, D.G. (1987). _Static Scheduling of Synchronous Data Flow Programs._ IEEE Transactions on Computers, C-36(1), 24–35.
- Bainomugisha, E. et al. (2013). _A Survey on Reactive Programming._ ACM Computing Surveys, 45(4), Article 52.
- Cooper, G.H. & Krishnamurthi, S. (2006). _Embedding Dynamic Dataflow in a Call-by-Value Language._ ESOP 2006.
- Czaplicki, E. & Chong, S. (2013). _Asynchronous Functional Reactive Programming for GUIs._ PLDI 2013.
- Maier, I. & Odersky, M. (2012). _Deprecating the Observer Pattern with Scala.React._ EPFL Technical Report.
- Jane Street. _Incremental_, a library for self-adjusting computations. https://github.com/janestreet/incremental
- Solid. _Reactivity: owners and roots._ https://docs.solidjs.com/
