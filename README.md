# mono

A monorepo for nodejs projects.

## setup

```sh
$  yarn setup:all
```

## memo

-   ディレクトリ
    -   `/experimental` ： メンテナンス対象外のコード置き場
    -   `/packages` ： メンテしているコード置き場
        -   `/apps` ： React などで作成されたアプリ
        -   `/utils` ： TypeScript や React などで使うライブラリ
-   package.json の devDependencies は基本的にルートのみに定義することにしている。
-   eslint
    -   commit 時の待ち時間削減のために husky hooks はあえて導入していない。代わりに GitHub Actions でチェックするようにしている。
    -   一部のルールは false positive が多いなどの理由で sub package 内で無効化していることがある。
