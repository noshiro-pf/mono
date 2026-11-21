---
title: インストール
description: synstate と、その UI ライブラリ synstate-dom、React・Preact・Preact Signals・ルーティング向けのバインディング、ESLint プラグインをインストールします。
---

## インストール

```sh
npm install synstate
```

`fromPromise`・`fromAbortablePromise`・`fromSubscribable` は [ts-std-forge](https://github.com/noshiro-pf/mono/tree/main/libs/ts-std-forge) の `Result` を流します。synstate は ts-std-forge に依存していますが、読む側のコードが `Result` を import するようになったら、自分の依存にも ts-std-forge を追加してください。

## 1 つのプログラムに 1 つのコピー

1 つのグラフが synstate の 2 つのコピーにまたがることはできません。別のコピーの Observable と組み合わせると例外を投げます。ロックファイルにはこのパッケージを 1 つのバージョンだけ置き、これを土台にするライブラリでは synstate-dom と同じく peer dependency として宣言してください。

## UI

- **[synstate-dom](/mono/synstate-dom/ja/)** は、同じスケジューラーの上で Observable を DOM に直接束縛します。束縛は synstate のグラフの末端そのものです。synstate のために作った UI ライブラリです。
- **[React と Preact](/mono/synstate/ja/integrations/react-and-preact/)**: `synstate-react-hooks`（React 18 以降）・`synstate-react-hooks-compat`（React 16.8 と 17）・`synstate-preact-hooks` は、状態をフックとして渡し、どの Observable でもコンポーネントから読めるようにします。
- **[Preact Signals](/mono/synstate/ja/integrations/preact-signals/)**: `synstate-preact-signals` は Observable と signal を双方向につなぎます。
- **[ルーティング](/mono/synstate/ja/integrations/router/)**: `synstate-router` と、そのバインディング `synstate-router-dom`・`synstate-router-react`・`synstate-router-preact` です。
- ほかのフレームワークに必要な数行は [UI と組み合わせる](/mono/synstate/ja/guides/using-with-a-ui/) で紹介しています。

## ESLint プラグイン

`eslint-plugin-synstate` は、グラフの働きを損なう書き方を報告します。派生値なら最初の更新に含まれるところで 2 回目の更新を始めてしまう、購読者からの状態への書き込み。オペレーターの中での例外。`{ equals: () => false }` を渡さなければ 1 回しか値を流さない、定数への `map`。入力そのものを返す `map`。等しい値をすでに落とすオペレーターの後の `skipIfNoChange` です。`synstate-dom` プリセットは synstate-dom の JSX 向けのルールを加えます。

```sh
npm install --save-dev eslint-plugin-synstate
```
