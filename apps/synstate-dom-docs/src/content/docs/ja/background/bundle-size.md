---
title: バンドルサイズ
description: 同じアプリケーションを synstate-dom、Solid、Preact + Signals、Preact、React、VanJS で書き、同じ Vite でバンドルしたときの minify 後・圧縮後のサイズ。
---

[`apps/synstate-dom-benchmark`](https://github.com/noshiro-pf/mono/tree/main/apps/synstate-dom-benchmark) は、各ライブラリがアプリケーションに足すサイズも計る。`pnpm run bundle-size` は[ベンチマーク](/mono/synstate-dom/ja/background/benchmark/)が計時する実装を、アプリケーションとライブラリの組ごとに 1 つずつバンドルし、minify して圧縮する。以下の数値はその [`BUNDLE-SIZE.md`](https://github.com/noshiro-pf/mono/blob/main/apps/synstate-dom-benchmark/BUNDLE-SIZE.md) から埋め込んだものである。

## 計るもの

- **すべての export**：ライブラリのエントリポイントの export をすべて残したもので、何も tree-shaking されない。synstate-dom は `synstate-dom` と `synstate`、Solid は `solid-js` と `solid-js/web`、Preact は `preact` と `preact/hooks`（Preact + Signals はこれに `@preact/signals`）、React は `react`、`react-dom`、`react-dom/client`、VanJS は `vanjs-core` を数える。上限であって、アプリケーションが配信するものではない。
- **カウンター**：数を表示し、クリックで 1 足すボタンを、各ライブラリの書き方で書いたもの。アプリケーションのコードを書く前にライブラリがかかる分である。
- **js-framework-benchmark の表**：[ベンチマーク](/mono/synstate-dom/ja/background/benchmark/)の表とその 8 つの操作。
- **ローン**・**工程表**・**ズームのシナリオ**：ベンチマークの 3 つの[シナリオ](/mono/synstate-dom/ja/background/benchmark/#シナリオ)。

どのバンドルも同じ Vite（Rolldown と Oxc の minifier）で、計時と同じ設定でビルドする。どのライブラリも production ビルドと production 用の JSX ランタイムを使い、Solid のファイルは `vite-plugin-solid` を通す。そのため tree-shaking の条件はどのライブラリでも同じで、計るコードは計時するコードと同じである。実装どうしで共有するコード（表の行を作る関数と各シナリオのモデル）はどの列にも入っている。

## 結果

<!-- bundle-size:environment -->

Vite 8.3.4 でバンドルした。バージョンは `synstate-dom 0.3.0`, `synstate 6.0.0`, `solid-js 1.9.17`, `preact 10.29.8`, `@preact/signals 2.11.3`, `react 19.3.1`, `react-dom 19.3.1`, `vanjs-core 1.6.1`。

<!-- /bundle-size -->

### minify して gzip

gzip はレベル 9。1 kB は 1,000 バイトで、小さいほどよい。

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

Brotli は品質 11。

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

- **カウンターの行が下限である。** アプリケーションがその上に足すのは自身のコードと、使うライブラリの部分で、ここのアプリケーションではどのライブラリでも多くて数 kB である。ライブラリの順位はカウンターの行で決まり、その下の行でも変わらない。
- **React** はアプリケーションによらずほぼ react-dom である。reconciler と scheduler はコンポーネントが使うものによって分かれないので、行どうしの差は 1 kB ほどである。
- **VanJS** は tree-shaking するところのない小さな 1 モジュールなので、カウンターでその全体になる。
- **Solid** は JSX をテンプレートにコンパイルして小さなランタイムを呼ぶので、カウンターは `solid-js/web` のわずかな部分しか使わない。すべての export はその数倍ある。
- **Preact** は小さな仮想 DOM で、Signals はそのリアクティブなコアと、signal を DOM に束縛する統合部分を足す。Preact の表がすべての export より大きいのは、行が `preact/compat` の `memo` を使い、すべての export の行がそれを数えないからである。
- **synstate-dom** は synstate の伝播のコア（グラフ、深さ順の伝播、スコープ）、自身の JSX ランタイムと束縛の表、両者が ts-data-forge と ts-std-forge から import するヘルパーを含む。どの行でも React の次に大きい。すでに synstate を使うアプリケーションはそのコアの分を一度だけ払い、モデルがどの列でも ts-data-forge を使うシナリオでは、そのヘルパーを synstate と共有する。
- **すべての export** は React を除くと synstate-dom と Solid で大きい。synstate は RxJS と同じく一揃いのオペレーターを export し、アプリケーションには import したものだけが残る。

## 実行

```sh
pnpm run ws:build            # synstate-dom と synstate は dist/ から import する
cd apps/synstate-dom-benchmark
pnpm run bundle-size         # BUNDLE-SIZE.md を書き換える
cd ../synstate-dom-docs
pnpm run gen:bundle-size     # BUNDLE-SIZE.md をこのページに埋め込む
```

サイズはソースとインストールされたバージョンだけで決まるので、1 回の実行で足りる。CI では実行しないので、BUNDLE-SIZE.md は最後に実行したときのツリーのものである。
