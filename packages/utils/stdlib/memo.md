# memo

-   TS v4.4.2 時点の lib を使用（`unchanged` ディレクトリに置いた）
-   `node_modules/typescript/lib` 配下の `lib.*` ファイルをコピー
-   `/// <reference lib="XXX" />` を `/// <reference path="./lib.XXX.d.ts" />` に書き換え
    -   Find: `/// <reference lib="(.+)" />`
    -   Replace: `/// <reference path="lib.$1.d.ts" />`
