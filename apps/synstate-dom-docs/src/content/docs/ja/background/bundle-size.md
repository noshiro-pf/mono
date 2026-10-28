---
title: バンドルサイズ
description: 同じアプリケーションを synstate-dom、Solid、Preact + Signals、Preact、React、VanJS で書き、同じ Vite でバンドルしたときの、minify 後・圧縮後のサイズです。
---

[`apps/synstate-dom-benchmark`](https://github.com/noshiro-pf/mono/tree/main/apps/synstate-dom-benchmark) では、各ライブラリがアプリケーションにどれだけサイズを足すかも計っています。`pnpm run bundle-size` は、[ベンチマーク](/mono/synstate-dom/ja/background/benchmark/)で時間を計っている実装を、アプリケーションとライブラリの組ごとに 1 つずつバンドルし、minify して圧縮します。以下の数値は、その [`BUNDLE-SIZE.md`](https://github.com/noshiro-pf/mono/blob/main/apps/synstate-dom-benchmark/BUNDLE-SIZE.md) から埋め込んだものです。

## 計るもの

- **すべての export**：ライブラリのエントリポイントの export をすべて残したもので、何も tree-shaking されません。synstate-dom は `synstate-dom` と `synstate`、Solid は `solid-js` と `solid-js/web`、Preact は `preact` と `preact/hooks`（Preact + Signals はこれに `@preact/signals` を加えたもの）、React は `react`、`react-dom`、`react-dom/client`、VanJS は `vanjs-core` を数えています。あくまで上限であって、アプリケーションが実際に配信するサイズではありません。
- **カウンター**：数を表示して、クリックすると 1 足すボタンを、各ライブラリの流儀で書いたものです。アプリケーションのコードを書く前の時点で、ライブラリだけでかかる分にあたります。
- **js-framework-benchmark の表**：[ベンチマーク](/mono/synstate-dom/ja/background/benchmark/)の表と、その 8 つの操作です。
- **ローン**・**工程表**・**ズームのシナリオ**：ベンチマークの 3 つの[シナリオ](/mono/synstate-dom/ja/background/benchmark/#シナリオ)です。

どのバンドルも同じ Vite（Rolldown と Oxc の minifier）を使い、時間を計るときと同じ設定でビルドしています。どのライブラリも production ビルドと production 用の JSX ランタイムを使い、Solid のファイルは `vite-plugin-solid` を通します。なので tree-shaking の条件はどのライブラリでも同じですし、サイズを計るコードは時間を計るコードと同じです。実装どうしで共有しているコード（表の行を作る関数と、各シナリオのモデル）は、どの列にも含まれています。

## 結果

<!-- bundle-size:environment -->

Vite 8.3.4 でバンドルしました。バージョンは `synstate-dom 0.3.0`, `synstate 6.0.0`, `solid-js 1.9.17`, `preact 10.29.8`, `@preact/signals 2.11.3`, `react 19.3.1`, `react-dom 19.3.1`, `vanjs-core 1.6.1` です。

<!-- /bundle-size -->

### minify して gzip

gzip はレベル 9 です。1 kB は 1,000 バイトで、小さいほど良い結果です。

<!-- bundle-size:gzip -->

| アプリケーション（kB）      | synstate-dom | Solid | Preact + Signals | Preact | React | VanJS |
| :-------------------------- | -----------: | ----: | ---------------: | -----: | ----: | ----: |
| すべての export             |         15.2 |  14.7 |              9.3 |    6.2 |  67.7 |   1.2 |
| カウンター                  |          8.3 |   4.0 |              7.9 |    5.4 |  67.5 |   1.2 |
| js-framework-benchmark の表 |         10.6 |   5.1 |              8.7 |    8.3 |  68.3 |   1.9 |
| ローンのシナリオ            |         10.8 |   4.8 |              9.1 |    6.7 |  68.7 |   2.4 |
| 工程表のシナリオ            |         10.8 |   4.2 |              8.5 |    6.1 |  68.1 |   1.7 |
| ズームのシナリオ            |         10.5 |   3.9 |              8.2 |    5.9 |  67.9 |   1.5 |

<!-- /bundle-size -->

### minify して Brotli

Brotli は品質 11 です。

<!-- bundle-size:brotli -->

| アプリケーション（kB）      | synstate-dom | Solid | Preact + Signals | Preact | React | VanJS |
| :-------------------------- | -----------: | ----: | ---------------: | -----: | ----: | ----: |
| すべての export             |         13.7 |  13.4 |              8.5 |    5.6 |  58.3 |   1.1 |
| カウンター                  |          7.5 |   3.6 |              7.3 |    4.9 |  58.2 |   1.1 |
| js-framework-benchmark の表 |          9.7 |   4.6 |              8.0 |    7.6 |  58.9 |   1.8 |
| ローンのシナリオ            |          9.8 |   4.4 |              8.3 |    6.1 |  59.2 |   2.1 |
| 工程表のシナリオ            |          9.8 |   3.8 |              7.8 |    5.6 |  58.7 |   1.6 |
| ズームのシナリオ            |          9.6 |   3.6 |              7.6 |    5.4 |  58.5 |   1.4 |

<!-- /bundle-size -->

## 結果の読み方

- **カウンターの行が下限です。** アプリケーションがその上に足すのは、自分自身のコードと、使っているライブラリの部分だけで、ここで計ったアプリケーションならどのライブラリでも多くて数 kB です。ライブラリの順位はカウンターの行で決まり、その下の行でも変わりません。
- **React** は、アプリケーションが何であってもほとんどが react-dom です。reconciler と scheduler はコンポーネントが何を使うかによって分かれないので、行どうしの差は 1 kB ほどしかありません。
- **VanJS** は tree-shaking する余地のない小さな 1 モジュールなので、カウンターの時点でその全体が入ります。
- **Solid** は JSX をテンプレートにコンパイルして小さなランタイムを呼び出すので、カウンターでは `solid-js/web` のごく一部しか使いません。すべての export はその数倍あります。
- **Preact** は小さな仮想 DOM で、Signals はそこにリアクティブなコアと、signal を DOM に束縛する統合部分を足します。Preact の表がすべての export より大きいのは、表の行が `preact/compat` の `memo` を使っていて、すべての export の行ではそれを数えていないからです。
- **synstate-dom** には、synstate の伝播のコア（グラフ、深さ順の伝播、スコープ）、自身の JSX ランタイムと束縛の表、そして両者が ts-data-forge と ts-std-forge から import するヘルパーが含まれています。どの行でも React の次に大きくなっています。ただ、すでに synstate を使っているアプリケーションなら、そのコアの分は一度払えば済みます。また、モデルがどの列でも ts-data-forge を使うシナリオでは、そのヘルパーを synstate と共有します。
- **すべての export** は、React を除くと synstate-dom と Solid が大きくなっています。synstate は RxJS と同じようにオペレーターを一揃い export していますが、アプリケーションに残るのは import したものだけです。

## 実行

```sh
pnpm run ws:build            # synstate-dom と synstate は dist/ から import します
cd apps/synstate-dom-benchmark
pnpm run bundle-size         # BUNDLE-SIZE.md を書き換えます
cd ../synstate-dom-docs
pnpm run gen:bundle-size     # BUNDLE-SIZE.md をこのページに埋め込みます
```

サイズはソースとインストールされたバージョンだけで決まるので、1 回実行すれば十分です。CI では実行していないので、BUNDLE-SIZE.md は最後に実行したときのツリーでの値です。
