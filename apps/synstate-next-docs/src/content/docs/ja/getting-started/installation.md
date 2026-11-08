---
title: インストール
description: リポジトリ内のパッケージに synstate-next と、その UI 層である synstate-dom-next を追加します。
---

## インストール

synstate-next はまだ公開していません。リポジトリ内のパッケージからは、ワークスペースパッケージとして依存します。

```jsonc
{
    "dependencies": {
        "synstate-next": "workspace:*",
    },
}
```

`fromPromise`・`fromAbortablePromise`・`fromSubscribable` は [ts-std-forge](https://github.com/noshiro-pf/mono/tree/main/libs/ts-std-forge) の `Result` を流します。synstate-next は ts-std-forge に依存していますが、読む側のコードが `Result` を import するようになったら、自分の依存にも ts-std-forge を追加してください。

## 1 つのプログラムに 1 つのコピー

1 つのグラフが synstate-next の 2 つのコピーにまたがることはできません。別のコピーの Observable と組み合わせると例外を投げます。ロックファイルにはこのパッケージを 1 つのバージョンだけ置き、これを土台にするライブラリでは synstate-dom-next と同じく peer dependency として宣言してください。

## UI

- **[synstate-dom-next](/mono/synstate-dom-next/ja/)** は、同じスケジューラーの上で Observable を DOM に直接束縛します。束縛は synstate-next のグラフの effect そのものです。synstate-next のために作った UI ライブラリです。
- React と Preact のフック、Preact Signals との橋渡し、ルーターはまだ作り直していません。それまでは、[UI と組み合わせる](/mono/synstate-next/ja/guides/using-with-a-ui/)で、どのフレームワークでも必要になる数行を紹介しています。

## ESLint プラグイン

`eslint-plugin-synstate` は synstate 向けに書かれています。伝播中の書き込みについてのルールは synstate-next にもそのまま当てはまります（購読者からの書き込みが 2 回目の更新を始めることは変わりません）が、プラグインはまだ synstate-next のパッケージ名を見ていません。
