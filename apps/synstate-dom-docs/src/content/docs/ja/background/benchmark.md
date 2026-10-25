---
title: ベンチマーク
description: js-framework-benchmark の操作で synstate-dom を Solid、Preact + Signals、Preact、React、VanJS と比べる。
---

[`apps/synstate-dom-benchmark`](https://github.com/noshiro-pf/mono/tree/main/apps/synstate-dom-benchmark) は、[js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) の操作（表の行の作成・置き換え・部分更新・選択・入れ替え・削除・追加・全消去）で synstate-dom を Solid、Preact + Signals、Preact、React、VanJS と比べる。

以下の数値はその [`RESULTS.md`](https://github.com/noshiro-pf/mono/blob/main/apps/synstate-dom-benchmark/RESULTS.md) から埋め込んだもので、1 台のマシンでの計測である。この計測の中で実装を互いに比べるためのもので、js-framework-benchmark が公開している表とは比べられない。

## 結果

<!-- benchmark:environment -->

計測環境は `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.8010.12 Safari/537.36`。各値は 8 回の実行の中央値で、実行ごとにライブラリを計る順番を変え、各実行の値もその中で計った回の中央値である。

<!-- /benchmark -->

### 中央値

小さいほど速い。

<!-- benchmark:medians -->

| 操作（中央値 ms）              | synstate-dom |  Solid | Preact + Signals | Preact |  React |  VanJS |
| :----------------------------- | -----------: | -----: | ---------------: | -----: | -----: | -----: |
| 1,000 行を作る                 |        21.05 |  16.85 |            17.85 |  15.25 |  19.70 |  18.15 |
| 1,000 行をすべて置き換える     |        24.40 |  17.60 |            23.25 |  21.45 |  21.45 |  20.15 |
| 1,000 行の 10 行ごとに更新する |        10.65 |   8.45 |             8.70 |   9.05 |   9.40 |   9.00 |
| 行を選択する                   |         4.65 |   4.20 |             4.75 |   4.20 |   4.55 |  29.15 |
| 2 行を入れ替える               |         6.10 |   4.85 |             5.00 |   5.60 |  17.05 |   5.05 |
| 1 行を削除する                 |         6.60 |   4.70 |             4.95 |   5.20 |   5.35 |   5.40 |
| 10,000 行を作る                |       216.55 | 148.95 |           216.35 | 180.35 | 363.60 | 200.95 |
| 1,000 行に 1,000 行を追加する  |        25.10 |  20.35 |            23.45 |  22.30 |  22.35 |  22.90 |
| 1,000 行を消す                 |         7.75 |   5.50 |             6.45 |   4.20 |   6.20 |   6.40 |

<!-- /benchmark -->

### synstate-dom に対する倍率

各ライブラリの時間を synstate-dom の時間で割ったもの。1.00× より小さければ synstate-dom より速く、大きければ遅い。

<!-- benchmark:ratios -->

| 操作                           | Solid | Preact + Signals | Preact | React | VanJS |
| :----------------------------- | ----: | ---------------: | -----: | ----: | ----: |
| 1,000 行を作る                 | 0.80× |            0.85× |  0.72× | 0.94× | 0.86× |
| 1,000 行をすべて置き換える     | 0.72× |            0.95× |  0.88× | 0.88× | 0.83× |
| 1,000 行の 10 行ごとに更新する | 0.79× |            0.82× |  0.85× | 0.88× | 0.85× |
| 行を選択する                   | 0.90× |            1.02× |  0.90× | 0.98× | 6.27× |
| 2 行を入れ替える               | 0.80× |            0.82× |  0.92× | 2.80× | 0.83× |
| 1 行を削除する                 | 0.71× |            0.75× |  0.79× | 0.81× | 0.82× |
| 10,000 行を作る                | 0.69× |            1.00× |  0.83× | 1.68× | 0.93× |
| 1,000 行に 1,000 行を追加する  | 0.81× |            0.93× |  0.89× | 0.89× | 0.91× |
| 1,000 行を消す                 | 0.71× |            0.83× |  0.54× | 0.80× | 0.83× |

<!-- /benchmark -->

## 結果の読み方

この計測では、synstate-dom は操作によって Solid の <!-- benchmark:reference-min -->1.11<!-- /benchmark --> 倍から <!-- benchmark:reference-max -->1.45<!-- /benchmark --> 倍の時間がかかった。どの操作でも最速ではない。ほかのライブラリより速い操作と遅い操作は上の表にある。

- **行の作成**は、コンパイラがないことが最も表れるところである。Solid は行ごとにコンパイル済みの `<template>` を複製する。synstate-dom はノードごとに `createElement` を呼び、動的な葉をそれぞれ購読で束縛する。行ごとに要素と位置のための synstate のノードも 2 つ作り（[制御構文](/mono/synstate-dom/ja/guides/control-flow/#for)の `For` を参照）、行の作成と破棄の時間はノード数にほぼ比例して増える。
- **部分更新**は実装によって経路が違う。Solid・Preact + Signals・VanJS はラベルごとに signal を持ち、変わる 100 個に書き込む。synstate-dom はドキュメントが勧めるとおり配列全体を置き換え、各行の `item$` が前回の要素と比べて、要素が変わった 100 行だけが DOM に書き込む。Preact と React は新しい状態から表を再描画し、props が変わった `memo` の行だけが描画し直される。
- **行の選択**は、Solid では `createSelector` によって 2 行だけに触れ、Preact と React では `memo` の行 2 つを再描画する。synstate-dom では各行が選択状態を `view` で束縛しているので 1,000 個の `view` がすべて実行され、各行のクラスが切り替えられる。Preact + Signals も同様に行ごとの `useComputed` を再計算する。

## 計測しているもの

各実装は同じ表をマウントする。要素ごとに 1 行で、要素の id とラベルを 2 つのセルに置き、選択中の行に `danger` クラスを付ける。計測の前に、同じ操作の後にすべての実装が同じ行を描画することを確かめる。

各操作は、呼び出しからマクロタスクが 1 つ過ぎてブラウザが表をレイアウトし直すまでを計る。VanJS は変更を `setTimeout` で反映し、Preact は変わったリストをマイクロタスクで描画するので、この待ちを入れている。待ちはすべての実装が払うので、どの値もほぼ同じだけずれる。

ライブラリは本番ビルド（`mode: 'production'` と `production` の export 条件）と本番用の JSX ランタイムで、Vitest のブラウザモードのヘッドレス Chromium で動かす。

## 各実装の書き方

それぞれ、自身のドキュメントか js-framework-benchmark のエントリーがこのような表を書くやり方に従う。

- **synstate-dom**: 行は `createState` の中の 1 つのイミュータブルな配列で、`For` が各行の値をそこから派生させる。選択状態は各行が `view` で束縛する state である。ドキュメントが勧める書き方で、チューニングしたものではない。
- **Solid**: ラベルごとの signal、行オブジェクトに対する `For`、選択に `createSelector` を使い、選択で触れるのは 2 行になる。`vite-plugin-solid` でコンパイルする。
- **Preact + Signals**: ラベルごとの signal と行ごとの `useComputed` のクラスを、どちらも signal として DOM に束縛する。リストはキー付きで再描画する。
- **Preact** と **React**: 行と選択状態をトップの `useState` の 1 つのイミュータブルな状態に持ち、各行はラベルと選択中かどうかを受け取る `memo` コンポーネントである。React は変更ごとに `flushSync` で描画し、Preact はマイクロタスクで描画する。
- **VanJS**: ラベルごとの state と行ごとのクラス関数。リストは手で管理し、行の要素を直接移動・削除する。

## 実行する

CI では実行しない。共有のランナーでの時間はあまり意味がなく、アサートするベンチマークは不安定になるだけだからである。同じマシンでも 1 回ごとに 10〜30% ばらつくので、ここの数値は複数回の中央値を取る `benchmark:repeat` によるものである。

```sh
pnpm run ws:build            # synstate-dom と synstate は dist/ から import する
cd apps/synstate-dom-benchmark
pnpm run benchmark:repeat    # 5 回の中央値。RESULTS.md を書き直す
cd ../synstate-dom-docs
pnpm run gen:benchmark       # RESULTS.md をこのページに埋め込む
```
