# mono

A monorepo for nodejs projects.

## Setup

```sh
$  yarn
$  yarn ws:build
```

## monorepo 構成

-   ディレクトリ
    -   `/packages` ： メンテしているコード置き場。 package.json の存在するディレクトリはすべて workspace として扱われる。
        -   `/apps` ： React などで作成されたアプリ
        -   `/utils` ： TypeScript や React などで使うライブラリ
    -   `/experimental` ： メンテナンス対象外のコード置き場
-   package.json の内容について
    -   パッケージ名は原則 `@noshiro/` 始まりにしてある。
    -   `prettier-plugin-packagejson` を入れており、（エディタの onSaveFormat あるいは CLI で） prettier 実行時に package.json のソートが走るようにしている。
    -   dependencies に記述されていないパッケージがソースコード中で使われている場合には eslint ルール（https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-extraneous-dependencies.md ）でエラーが出るようになっており、 dependencies 記述漏れはここでチェックされる。
    -   各 workspace の devDependencies は基本的に使用せず、ルートディレクトリの package.json にまとめて記述している。型定義を共有している都合で TypeScript のバージョンも monorepo 全体で統一している（ `/experimental` 配下は除く）。
    -   npm scripts 定義
        -   直接手動実行しない想定の内部コマンドには `z:` または `zz:` プレフィックスをつけて後ろにソートされるようにしている。
-   コマンド実行ツール
    -   npm-run-all
        -   用途
            -   複数コマンドの並列 (run-s) or 直列実行 (run-p) を行う。
            -   主に単独 workspace 内のコマンド実行で使用している。
    -   wsrun
        -   用途
            -   複数 workspace をまたいで同名コマンドを一括実行する。
        -   `--stages` または `--serial` オプションで実行する場合、各 package.json の dependencies の依存グラフにしたがって順番に実行することができる。
    -   wireit
        -   用途
            -   コマンド実行をキャッシュし、再実行時に入出力ファイル群に変化がなければ実行をスキップする。
            -   コマンド間の依存関係を記述する。
                -   あるコマンドの前に別のコマンドを実行する必要がある場合に使用している。
                -   packages/utils に関しては repository 初期設定として予めビルドしておく運用を想定しており、 packages/apps 内の各コマンドで依存 utils の build を dependencies に加えることはしていない（記述が多くなるデメリットがあり、キャッシュされた結果とはいえ実行時間が伸びることによる不便さが大きいため）。
        -   TODO: `Wireit could not find the script name in the "npm_config_argv" environment variable. Arguments may not be interpreted correctly. See https://github.com/yarnpkg/yarn/issues/8905, and please consider upgrading to yarn 3.x or switching to npm.` という警告が出ているので yarn v3 に更新する。
-   configs
    -   eslint
        -   共通定義を `config/eslintrc/eslint-rules` に定義している。
            -   `plugin:@typescript-eslint:recommended` 等の public な config は使っておらず、 rule の設定を明示的に記述している。
                -   主に多数の config を extends に追加した際のルール設定の上書き結果が曖昧になる問題を避けるため。各ルールはちょうど 1 回ずつ定義されている状態になっている。
                -   `@typescript-eslint` のルールに対応する `eslint` のルールや `prettier` と競合するルールを無効化する必要がある場合があるが、これらは適宜 plugin の提供している config を参考に手動で設定している。
                -   `prettier` と競合する eslint のスタイリング関係のルールを off にする設定は、 `eslint --fix` 結果と `prettier --write` 結果が競合していないことにより正しさを確認しているがそれ以上のことはしていない。
            -   このディレクトリ内の config には rule に option まで型が付き補完が効くようになっている。
            -   この型定義は各 eslint plugin の schema から `config/eslintrc/generate-rules-type` 内のスクリプトで自動生成（その後一部手動修正）している。
                -   `yarn gen-eslint-rules-type` により生成（その後一部手動修正が必要）
            -   この仕組みにより、 plugin アップデート時には上のコマンドを実行し git 差分を確認することで、追加・削除されたルールを発見できるようになっている。
                -   schema に deprecated フラグが設定されているルールの severity は `"off"` しか選べないような型を生成しているため、 deprecated になったルールが有効のままにはならないことを保証している（`type-check:root` で型チェックできる）。
        -   commit 時の待ち時間削減のために husky hooks はあえて導入していない。代わりに GitHub Actions でチェックするようにしている。
        -   一部のルールは false positive が多いなどの理由で workspace ごとに個別に無効化していることがある。
    -   tsconfig
        -   各 workspace で継承する共通 tsconfig 定義を置いている。
        -   `nolib` の付いた tsconfig は標準ライブラリをデフォルトで読み込まない設定になっている。代わりに各 workspace のルート index.ts などで `/// <reference path="../../../utils/stdlib/stdlib.d.ts" />` のように reference 文を入れてカスタム lib 型定義を読み込むようにしている。ほとんどの TypeScript project の workspace で nolib の tsconfig を使用している。
        -   `packages/utils/stdlib/stdlib.d.ts` の型定義は、TypeScript の標準 lib 型定義を元に半自動生成しており、一部の型を厳格化する目的で作成している（詳細は `packages/utils/stdlib` の script 等を参照）。
-   特殊 utility の説明
    -   `packages/utils/stdlib`
        -   TypeScript の標準ライブラリの型を一部厳格化した型を提供するパッケージ。
        -   workspace のルート index.ts などで `/// <reference path="../../../utils/stdlib/stdlib.d.ts" />` のように reference 文を入れてこのカスタム lib 型定義を読み込ませる使い方ができる。標準ライブラリをオフにする必要があるため、 tsconfig.\*\*.nolib.json を併せて使う必要がある。
    -   `packages/utils/ts-type-utils`
        -   TypeScript 型ユーティリティ集。workspace 内で `DeepReadonly` などの型を使用できるようにする。
        -   `stdlib.d.ts` と同様 `/// <reference path="../../../utils/ts-type-utils/ts-type-utils.d.ts" />` のように reference 文を入れて読み込ませる。
    -   `packages/utils/global-*`
        -   `packages/apps` 内の各パッケージで使用。
        -   `global-X` は、 (P)React プロジェクトで頻繁に使うユーティリティを import 無しで使用できるようにするためのツール。 workspace に適切に設定すると `React.useMemo`　などのユーティリティを import 無しで使えるようになる。
        -   Vite の bundle 時に import 文を自動挿入するための inject plugin の共通設定や、型定義などを提供している。

## Workspace 追加方法

-   Preact app
    -   `yarn create:preact-app:vite <package-name> && yarn`
-   React app
    -   `yarn create:react-app:vite <package-name> && yarn`
-   Utility
    -   `yarn create:util <package-name> && yarn`
-   Slides
    -   `yarn create:slides <package-name> && yarn`

各ディレクトリに設置してある template workspace がコピーされ、ディレクトリ名と package.json 内の name フィールドが `<package-name>` で置換される。
ディレクトリ作成後に yarn を実行して workspace として認識させる必要がある（しないと node_modules 内に symlink が張られない）。

## CI

Github Actions で実行される。

workflow は .github ディレクトリに定義されている。

現状は `"ci"` コマンドをそのまま実行するようになっている。

`ci:clean-*` コマンドは、package.json 等が正しく依存関係を記述しているかをローカルで確認するために、ビルド済み utils 等のキャッシュを削除して `"ci"` コマンドを実行するために用意している。

### branch

-   `main` ： デフォルトブランチ
-   `develop` ： 開発用のブランチ
-   `archive/*` ： 作業中のコード置き場
-   `deploy-rich-poll` ： `packages/app/poll-discord-app` のデプロイトリガーにしているブランチ。
    -   `main` ブランチへの関係ない変更で Railway への無駄なデプロイが走らないようにするため。

### dependencies memo

-   `@babel/preset-react`
    -   `vite-plugin-markdown` の依存だが別途 install が必要
        -   https://github.com/hmsk/vite-plugin-markdown/issues/447
