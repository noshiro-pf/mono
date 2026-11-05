---
title: バンドルサイズ
description: SynState とベンチマークの各ライブラリが、各シナリオで使うコードのためにアプリケーションへ加えるサイズを、依存込みで比べます。
sidebar:
    order: 7
---

[ベンチマーク](/mono/synstate/ja/guides/library-comparison/benchmark/)は各ライブラリの速さを測ります。このページは、各ライブラリを配布するのにかかるサイズを測ります。シナリオごとに、その実装がライブラリから import しているエクスポートを、それが依存するものすべてと一緒にバンドルし、minify して圧縮します。値は `apps/synstate-docs` の `pnpm run bundle-size` で計測し、ページと一緒にコミットしています。計測したバージョンは「結果」に載せています。synstate-dom と UI フレームワークの比較は [synstate-dom のバンドルサイズ](/mono/synstate-dom/ja/background/bundle-size/)にあります。

## 何を測っているか

- **すべてのエクスポート**： ライブラリのエントリポイントのエクスポートをすべて丸ごと残したもの。`synstate`・`rxjs`・`mobx`・`jotai/vanilla` と `jotai/vanilla/utils`・`@reduxjs/toolkit`・`solid-js`・`@preact/signals-core`・`zustand/vanilla`・`valtio/vanilla` です。上限として読んでください。アプリケーションに残るのは import したものだけです。Jotai は、React バインディングを除いて同じ関数をエクスポートする vanilla のエントリポイントで測っています。
- **シナリオの行**： そのシナリオの実装が import しているエクスポート（たとえばダイヤモンドでは `synstate` の `createState`・`derive`・`map`）を、tree-shaking で落ちないようにすべて生かしたもの。バンドルはその実装が必要とするライブラリのコードです。実装自身のループと、ベンチマークのハーネスが呼ぶ ts-data-forge のヘルパーは数えません。数えると、ts-data-forge に自分で依存している SynState 以外のすべてのライブラリに上乗せされてしまうからです。ベンチマークが 1 つのライブラリを 2 通りで測っているシナリオでは、「(naive …)」と付いていない自然な書き方の方を使います。ダッシュは、そのライブラリを測っていないシナリオです。
- **依存込み**： `synstate` は `ts-data-forge`・`ts-std-forge` と、Redux Toolkit は Redux・Immer・Reselect と、RxJS は tslib と一緒にバンドルします。これがアプリケーションがダウンロードするものです。[トップページ](/mono/synstate/ja/)・[はじめに](/mono/synstate/ja/getting-started/introduction/)・README に載せているサイズは、これとは違って `synstate` 単体の値です。すべてのエクスポートを、ここと同じ esbuild の設定で、ただし ts-data-forge と ts-std-forge を除いてバンドルし、minify ＋ gzip で <!-- bundle-size:comparison-synstate-alone -->7.1 kB<!-- /bundle-size:comparison-synstate-alone --> です。サイトのジェネレーターが現在のソースから計測するため、下の表より新しいことがあります。

どのバンドルも、ブラウザ向けに minify し、すべてのライブラリを本番ビルド（`process.env.NODE_ENV` と `import.meta.env.MODE` を `production`）で含めて、2 回ビルドします。本番モードで `browser` と `production` の export 条件を解決する Vite と、ライセンスコメントを除いた esbuild です。2 つのバンドラは tree-shaking で落とすコードが同じではなく、その差はライブラリによって大きく違うので、両方を載せます。gzip はレベル 9、Brotli は品質 11 です。1 kB は 1,000 バイトで、小さいほど良い値です。

## 結果

<!-- bundle-size:comparison-environment -->

Vite 8.3.5 と esbuild 0.28.2 でバンドル。`synstate`、`ts-data-forge`、`ts-std-forge` はこのリポジトリのソースからビルドしており、マニフェストのバージョン（`synstate 7.0.0`, `ts-data-forge 14.11.0`, `ts-std-forge 0.5.3`）にまだ含まれない変更を含むことがあります。その他のバージョン: `rxjs 7.8.2`, `jotai 3.0.1`, `mobx 7.1.0`, `@reduxjs/toolkit 2.13.0`, `zustand 5.0.15`, `valtio 2.3.2`, `solid-js 1.9.17`, `@preact/signals-core 1.14.4`。

<!-- /bundle-size:comparison-environment -->

### Vite： minify ＋ gzip

<!-- bundle-size:comparison-gzip -->

| シナリオ (kB)                                                                                                    | **SynState** | RxJS | MobX | Jotai | Redux | Solid | Preact Signals | Zustand | Valtio |
| :--------------------------------------------------------------------------------------------------------------- | -----------: | ---: | ---: | ----: | ----: | ----: | -------------: | ------: | -----: |
| すべてのエクスポート                                                                                             |          8.4 | 17.5 | 15.1 |   4.8 |  14.2 |   8.4 |            2.0 |     0.3 |    1.5 |
| [単一ステート](/mono/synstate/ja/guides/library-comparison/benchmark/#シナリオ-単一ステート)                     |          3.2 |  3.3 | 11.3 |   2.4 |   7.1 |   2.3 |            1.6 |     0.2 |    1.0 |
| [派生チェーン](/mono/synstate/ja/guides/library-comparison/benchmark/#シナリオ-派生チェーン)                     |          3.8 |  3.6 | 11.3 |   2.4 |   8.5 |   2.4 |            1.6 |       — |      — |
| [ダイヤモンド依存関係](/mono/synstate/ja/guides/library-comparison/benchmark/#シナリオ-ダイヤモンド依存関係)     |          4.1 |  6.0 | 11.3 |   2.4 |   8.5 |   2.4 |            1.6 |       — |      — |
| [ディープチェーン](/mono/synstate/ja/guides/library-comparison/benchmark/#シナリオ-ディープチェーンスループット) |          3.4 |  6.1 | 11.4 |   2.5 |   3.8 |   2.4 |            1.6 |       — |      — |
| [カスケードダイヤモンド](/mono/synstate/ja/guides/library-comparison/benchmark/#シナリオ-カスケードダイヤモンド) |          4.1 |  6.0 | 11.3 |   2.4 |   8.5 |   2.4 |            1.6 |       — |      — |
| [条件付きファンアウト](/mono/synstate/ja/guides/library-comparison/benchmark/#シナリオ-条件付きファンアウト)     |          4.3 |  5.7 | 11.3 |   2.4 |   3.8 |   2.4 |            1.6 |       — |      — |
| [等値カットオフ](/mono/synstate/ja/guides/library-comparison/benchmark/#シナリオ-等値カットオフ)                 |          3.8 |  6.0 | 11.3 |   2.4 |   8.5 |   2.4 |            1.6 |       — |      — |

<!-- /bundle-size:comparison-gzip -->

### Vite： minify ＋ Brotli

<!-- bundle-size:comparison-brotli -->

| シナリオ (kB)                                                                                                    | **SynState** | RxJS | MobX | Jotai | Redux | Solid | Preact Signals | Zustand | Valtio |
| :--------------------------------------------------------------------------------------------------------------- | -----------: | ---: | ---: | ----: | ----: | ----: | -------------: | ------: | -----: |
| すべてのエクスポート                                                                                             |          7.6 | 15.8 | 13.7 |   4.4 |  13.0 |   7.7 |            1.8 |     0.3 |    1.4 |
| [単一ステート](/mono/synstate/ja/guides/library-comparison/benchmark/#シナリオ-単一ステート)                     |          3.0 |  3.0 | 10.3 |   2.2 |   6.5 |   2.1 |            1.5 |     0.2 |    0.9 |
| [派生チェーン](/mono/synstate/ja/guides/library-comparison/benchmark/#シナリオ-派生チェーン)                     |          3.5 |  3.2 | 10.3 |   2.2 |   7.8 |   2.2 |            1.5 |       — |      — |
| [ダイヤモンド依存関係](/mono/synstate/ja/guides/library-comparison/benchmark/#シナリオ-ダイヤモンド依存関係)     |          3.8 |  5.5 | 10.3 |   2.2 |   7.8 |   2.2 |            1.5 |       — |      — |
| [ディープチェーン](/mono/synstate/ja/guides/library-comparison/benchmark/#シナリオ-ディープチェーンスループット) |          3.0 |  5.5 | 10.4 |   2.3 |   3.4 |   2.2 |            1.5 |       — |      — |
| [カスケードダイヤモンド](/mono/synstate/ja/guides/library-comparison/benchmark/#シナリオ-カスケードダイヤモンド) |          3.8 |  5.5 | 10.3 |   2.2 |   7.8 |   2.2 |            1.5 |       — |      — |
| [条件付きファンアウト](/mono/synstate/ja/guides/library-comparison/benchmark/#シナリオ-条件付きファンアウト)     |          4.0 |  5.2 | 10.3 |   2.2 |   3.4 |   2.2 |            1.5 |       — |      — |
| [等値カットオフ](/mono/synstate/ja/guides/library-comparison/benchmark/#シナリオ-等値カットオフ)                 |          3.5 |  5.5 | 10.3 |   2.2 |   7.8 |   2.2 |            1.5 |       — |      — |

<!-- /bundle-size:comparison-brotli -->

### esbuild： minify ＋ gzip

<!-- bundle-size:comparison-esbuild-gzip -->

| シナリオ (kB)                                                                                                    | **SynState** | RxJS | MobX | Jotai | Redux | Solid | Preact Signals | Zustand | Valtio |
| :--------------------------------------------------------------------------------------------------------------- | -----------: | ---: | ---: | ----: | ----: | ----: | -------------: | ------: | -----: |
| すべてのエクスポート                                                                                             |          9.8 | 18.6 | 15.8 |   5.1 |  15.2 |   8.7 |            2.0 |     0.3 |    1.6 |
| [単一ステート](/mono/synstate/ja/guides/library-comparison/benchmark/#シナリオ-単一ステート)                     |          3.8 |  3.5 | 12.0 |   2.5 |   8.5 |   2.7 |            1.6 |     0.3 |    1.0 |
| [派生チェーン](/mono/synstate/ja/guides/library-comparison/benchmark/#シナリオ-派生チェーン)                     |          4.4 |  3.8 | 11.9 |   2.5 |  10.1 |   2.8 |            1.7 |       — |      — |
| [ダイヤモンド依存関係](/mono/synstate/ja/guides/library-comparison/benchmark/#シナリオ-ダイヤモンド依存関係)     |          4.7 |  6.4 | 11.9 |   2.5 |  10.1 |   2.8 |            1.7 |       — |      — |
| [ディープチェーン](/mono/synstate/ja/guides/library-comparison/benchmark/#シナリオ-ディープチェーンスループット) |          3.9 |  6.4 | 12.1 |   2.7 |   5.1 |   2.8 |            1.7 |       — |      — |
| [カスケードダイヤモンド](/mono/synstate/ja/guides/library-comparison/benchmark/#シナリオ-カスケードダイヤモンド) |          4.7 |  6.4 | 11.9 |   2.5 |  10.1 |   2.8 |            1.7 |       — |      — |
| [条件付きファンアウト](/mono/synstate/ja/guides/library-comparison/benchmark/#シナリオ-条件付きファンアウト)     |          5.0 |  6.1 | 11.9 |   2.5 |   5.1 |   2.8 |            1.7 |       — |      — |
| [等値カットオフ](/mono/synstate/ja/guides/library-comparison/benchmark/#シナリオ-等値カットオフ)                 |          4.4 |  6.4 | 11.9 |   2.5 |  10.1 |   2.8 |            1.7 |       — |      — |

<!-- /bundle-size:comparison-esbuild-gzip -->

## SynState のバイトの内訳

`createState` だけを import する SynState の単一ステートのバンドルを、コードがどのパッケージから来たかで分け、バンドルに占める割合で示したものです。esbuild は各モジュールの minify 後のバイト数を報告します。Vite の下の Rolldown はチャンクを minify する前の各モジュールの長さを報告するので、Vite の列は minify 前のコードに占める割合です。

<!-- bundle-size:comparison-breakdown -->

| パッケージ                        | Vite | esbuild |
| :-------------------------------- | ---: | ------: |
| `synstate`                        |  57% |     47% |
| `ts-std-forge`                    |  19% |     31% |
| `ts-data-forge`                   |  24% |     22% |
| バンドル全体、minify ＋ gzip (kB) |  3.2 |     3.8 |

<!-- /bundle-size:comparison-breakdown -->

<!-- scripts/embed-bundle-size.mts の `claimsOfTheResults` は、この段落と「結果の読み方」の主張を一字一句引用し、値がそれを裏付けなくなると `gen:bundle-size` を失敗させます。主張を言い換えたらそこでも引用し直し、順位や差についての主張を足したらそこにケースを足してください。 -->

最も大きな割合を占めるのは `synstate` 自身です。残りは ts-data-forge と、ts-data-forge が土台にして re-export している ts-std-forge です。`synstate` が import するのは、`ts-data-forge/array` サブパスからの `Arr`、両パッケージの単独の関数（たとえば ts-std-forge の `panic`）、そして ts-std-forge が定義し ts-data-forge が re-export する `Optional` と `Result` のオブジェクトです。単一ステートのバンドルが使うのは `Optional` です。esbuild はこうしたオブジェクトのメンバーを 1 つでも使うと全体を残すので、esbuild では ts-std-forge の割合に、`synstate` が呼ばない `Optional` のメンバーも含まれます。どちらのパッケージも 3 つ目のパッケージのコードを持ち込まない（もう 1 つの依存 ts-type-forge は型だけを提供する）ので、バンドルにほかのパッケージは入りません。すでに ts-data-forge を使っているアプリケーションでは、この部分は自分のコードと共有され、払うのは一度だけです。

## 結果の読み方

- **SynState** は、どちらのバンドラーでもシナリオの行がすべて 5 kB 以下です。どの行でも MobX より小さく、単一ステートと派生チェーン以外のシナリオ（ダイヤモンド、ディープチェーン、カスケードダイヤモンド、条件付きファンアウト、等値カットオフ）では RxJS よりも小さくなります。どのシナリオの行でも、esbuild の値と Vite の値の差は 1 kB 以内です。
- **RxJS** は operator を 1 つずつ別のモジュールにしているので、行は実装が import する operator に応じて大きくなります。単一ステートでは `BehaviorSubject` だけ、ダイヤモンドでは `combineLatest` と `map` も加わります。
- **MobX** は一部でも使うとライブラリの大部分が残るので、シナリオの行はほとんど変わりません。
- **Redux** は、実装が `createSlice` を使う行で Immer を含みます。`createSlice` の reducer は Immer の draft を使うからです。ディープチェーンと条件付きファンアウトは `createAction` に照合する素の reducer で書いているので、Immer を含みません。
- **Solid** は反応系のコアである `solid-js` だけを数えています。これらのシナリオは何も描画しないので、`solid-js/web` はバンドルに入りません。
- **Jotai**・**Preact Signals**・**Zustand**・**Valtio** はどれもコアが小さく、どの行も SynState の同じ行より小さくなります。Zustand と Valtio はベンチマークと同じく単一ステートだけで測っています。vanilla API に派生値のノードがないためです。

## 実行方法

```sh
pnpm run ws:build:deps       # synstate とその依存は dist/ からバンドルされる
cd apps/synstate-docs
pnpm run bundle-size         # 計測して src/data/bundle-size-comparison.json に記録し、表を書き換える
```

サイズはソースとインストールされたバージョンだけで決まります。計測をやり直すワークフローはないので、`synstate`・その依存・比較対象のライブラリ・バンドラーが変わっても、このコマンドを実行するまで表は記載のバージョンでの値のままです。サイトの生成スクリプトは記録された値から表を描き、「SynState のバイトの内訳」や「結果の読み方」のうち、チェックしている主張が成り立たなくなると失敗します。
