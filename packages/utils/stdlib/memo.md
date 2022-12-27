# memo

-   TS v4.8.0-beta 時点の lib を使用（`unchanged` ディレクトリに置いた）
-   `node_modules/typescript/lib` 配下の `lib.*` ファイルをコピー
-   `/// <reference lib="XXX" />` を `/// <reference path="./lib.XXX.d.ts" />` に書き換え
    -   Find: `/// <reference lib="(.+)" />`
    -   Replace: `/// <reference path="lib.$1.d.ts" />`
-   `eslint --fix` で `readonly` を追加
-   `any[]` -> `never[]`
-   `declare var` -> `declare const`
<!-- -   use `JSONValue` in `JSON.parse`
-   use `ReadonlyJSONValue` in `JSON.parse` -->
-   手動修正
    -   `readonly` 削除
        -   `Partial`
        -   MapConstructor の結果を ReadonlyMap から Map に
        -   SetConstructor の結果を ReadonlySet から Set に
        -   Array
            -   ` Array<` で検索
            -   ArrayConstructor の返り値を mutable に
            -   `Array.from` の return type
            -   `Array.of` の return type
            -   ` readonly [n: number]: T;` -> ` [n: number]: T;`
                -   ArrayLike も
        -   `predicate` の返り値を `unknown` -> `boolean` に変更
            -   `predicate: \(.*unknown` と `predicate: \(\n` で検索
        -   `Array.sort` の `compareFn` を必須引数に変更
