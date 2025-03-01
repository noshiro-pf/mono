# memo

```sh
yarn gen
```

https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#supporting-lib-from-node_modules

### memo

-   lib.dom.d.ts, lib.webworker.d.ts には readonly 化の eslint fix を適用しないようにしている。
    これは、 `window.location.href` などの代入可能なプロパティが存在するためである。
    引数の配列型のみ readonly array にするための置換を変換スクリプトで別途行っている。
-   TypeScript デフォルトの lib ファイルの取得は submodule ではなく wget を使うようにしている。
    初回の clone に無駄が多く時間がかるのと、 ignore 設定などが増えて管理が面倒になったため。
