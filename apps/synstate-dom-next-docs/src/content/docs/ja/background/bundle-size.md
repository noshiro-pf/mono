---
title: バンドルサイズ
description: 同じアプリケーションを synstate-dom・synstate-dom-next・Solid で書き、同じ Vite でバンドルしたときの、minify・圧縮後のサイズです。
---

[`apps/synstate-dom-benchmark`](https://github.com/noshiro-pf/mono/tree/main/apps/synstate-dom-benchmark) は、各ライブラリがアプリケーションにどれだけのサイズを足すかも測ります。その `pnpm run bundle-size -- --next` は、[ベンチマーク](/mono/synstate-dom-next/ja/background/benchmark/)が時間を測る実装を、アプリケーションとライブラリの組ごとに 1 つずつバンドルし、minify して圧縮します。以下の数値は同アプリの [`BUNDLE-SIZE-NEXT.md`](https://github.com/noshiro-pf/mono/blob/main/apps/synstate-dom-benchmark/BUNDLE-SIZE-NEXT.md) から取っています。Preact + Signals・Preact・React・VanJS との比較は [synstate-dom のサイト](https://noshiro-pf.github.io/mono/synstate-dom/ja/background/bundle-size/)にあります。

## 何を測っているか

- **すべての export**：ライブラリのエントリポイントの export をすべてそのまま残したもので、何も tree-shaking されません。synstate-dom-next は `synstate-dom-next` と `synstate-next`、synstate-dom は `synstate-dom` と `synstate`、Solid は `solid-js` と `solid-js/web` を数えます。上限と考えてください。実際にこれを全部載せるアプリケーションはありません。
- **カウンター**：数を表示し、クリックで 1 増やすボタンを、各ライブラリの流儀で書いたものです。アプリケーションのコードを書く前に、ライブラリがおおよそいくらかかるかを表します。
- **js-framework-benchmark の表**：[ベンチマーク](/mono/synstate-dom-next/ja/background/benchmark/)の表で、8 つの操作を含みます。
- **ローン**・**工程表**・**ズームのシナリオ**：ベンチマークの 3 つの[シナリオ](/mono/synstate-dom-next/ja/background/benchmark/#シナリオ)です。

どのバンドルも同じ Vite（Rolldown と Oxc の minifier）で、時間を測るときと同じ設定でビルドします。どのライブラリも本番ビルドと本番用の JSX ランタイムを使い、Solid のファイルは `vite-plugin-solid` を通します。そのため、どのライブラリも同じように tree-shaking され、ここに出るサイズのコードは時間を測ったコードそのものです。実装が共有するコード（表の行のファクトリと各シナリオのモデル）は、どの列にも含まれます。

## 結果

<!-- bundle-size:environment -->

Vite 8.3.5 でバンドルしました。バージョンは `synstate-dom 0.8.0`, `synstate 7.0.2`, `synstate-dom-next 0.0.0`, `synstate-next 0.0.0`, `solid-js 1.9.17` です。

<!-- /bundle-size -->

### minify して gzip

gzip のレベルは 9 です。1 kB は 1,000 バイトで、小さいほど良い値です。

<!-- bundle-size:gzip -->

| アプリケーション（kB）      | synstate-dom | synstate-dom-next | Solid |
| :-------------------------- | -----------: | ----------------: | ----: |
| すべての export             |         12.8 |              11.9 |  14.7 |
| カウンター                  |          6.7 |               6.6 |   4.0 |
| js-framework-benchmark の表 |          8.8 |               9.1 |   5.1 |
| ローンのシナリオ            |          7.6 |               7.3 |   4.2 |
| 工程表のシナリオ            |          7.6 |               7.3 |   4.2 |
| ズームのシナリオ            |          7.4 |               7.1 |   4.0 |

<!-- /bundle-size -->

### minify して Brotli

Brotli の品質は 11 です。

<!-- bundle-size:brotli -->

| アプリケーション（kB）      | synstate-dom | synstate-dom-next | Solid |
| :-------------------------- | -----------: | ----------------: | ----: |
| すべての export             |         11.5 |              10.8 |  13.4 |
| カウンター                  |          6.1 |               6.0 |   3.6 |
| js-framework-benchmark の表 |          8.0 |               8.3 |   4.7 |
| ローンのシナリオ            |          6.9 |               6.6 |   3.8 |
| 工程表のシナリオ            |          6.9 |               6.7 |   3.8 |
| ズームのシナリオ            |          6.7 |               6.4 |   3.6 |

<!-- /bundle-size -->

## 結果の読み方

ここで挙げる数値は gzip のものです。

- **カウンターの行が基準です**。synstate-dom-next は <!-- bundle-size:counter-next -->6.6<!-- /bundle-size --> kB、synstate-dom は <!-- bundle-size:counter-dom -->6.7<!-- /bundle-size --> kB、Solid は <!-- bundle-size:counter-solid -->4.0<!-- /bundle-size --> kB です。カウンターでも、synstate-next の伝播の中核（owner、深さごとのキュー、値を計算し直すループ）と、description をノードと束縛に変える JSX ランタイムが入ります。Solid は JSX をテンプレートにコンパイルして小さなランタイムを呼び出すので、カウンターでは `solid-js/web` のごく一部しか使いません。
- **作り直しはサイズのためのものではありません。** クロージャと購読者のレコードを、メソッドをプロトタイプで共有するクラスに置き換え、完了と参照カウントをなくしたことでコードは減りました。一方で、分岐のコンポーネントが分岐を計算し直す前に外すためのチェック、行ごとに state を持つキー付きの行、`selector` を加えたことでコードは増えました。ローンのシナリオでは synstate-dom の <!-- bundle-size:loan-dom -->7.6<!-- /bundle-size --> kB に対して <!-- bundle-size:loan-next -->7.3<!-- /bundle-size --> kB です。
- **表**は <!-- bundle-size:table-next -->9.1<!-- /bundle-size --> kB で、synstate-dom は <!-- bundle-size:table-dom -->8.8<!-- /bundle-size --> kB、Solid は <!-- bundle-size:table-solid -->5.1<!-- /bundle-size --> kB です。キー付きの `For` と `selector` を使うのはこのアプリケーションだけなので、それらを取り込むのもこれだけです。
- **すべての export** は <!-- bundle-size:everything-next -->11.9<!-- /bundle-size --> kB で、synstate-dom は <!-- bundle-size:everything-dom -->12.8<!-- /bundle-size --> kB、Solid は <!-- bundle-size:everything-solid -->14.7<!-- /bundle-size --> kB です。synstate-next は synstate と同じく一通りのオペレーターを export しますが、アプリケーションに残るのは import したものだけです。シナリオのモデルはどの列でも ts-data-forge を使っており、synstate-dom-next はそのヘルパーをモデルと共有します。

## 実行のしかた

```sh
pnpm run ws:build                  # ライブラリは dist/ から import します
cd apps/synstate-dom-benchmark
pnpm run bundle-size -- --next     # BUNDLE-SIZE-NEXT.md を書き換えます
cd ../synstate-dom-next-docs
pnpm run gen:bundle-size           # BUNDLE-SIZE-NEXT.md をこのページに埋め込みます
```

サイズはソースとインストールしたバージョンだけで決まるので、1 回の実行で十分です。これは CI では動かないので、BUNDLE-SIZE-NEXT.md は最後に実行したときのツリーを反映しています。
