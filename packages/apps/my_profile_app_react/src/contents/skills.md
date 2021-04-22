# スキル

## 技術スタック

-   Git
-   bash
-   Web frontend
    -   Languages
        -   TypeScript（メイン）
            -   TSX
        -   (JavaScript)
        -   HTML
        -   CSS, Sass
    -   Frameworks
        -   React（メイン）
            -   フレームワークというよりライブラリだが役割的にここに入れた
        -   Preact
        -   Angular
        -   (Vue) （業務で軽微な修正をした程度）
        -   (Elm) （チュートリアルをやっただけ）
        -   (Cycle.js) （チュートリアルをやっただけ）
    -   Libraries
        -   State
            -   RxJS
                -   ちょっと複雑な非同期処理を書きやすくするために
            -   Immutable.js
                -   Set や Map の key に非 primitive 値を使いたいときなど
                -   ある程度複雑になりそうなとき、reducer を書きやすくするために
                -   Undo history が必要なときなど
        -   Routing
            -   React-router
            -   [Rocon](https://blog.uhy.ooo/entry/2020-08-10/rocon-alpha/)
                -   React-router の型安全性に不満があるので試したい（が、これを見つけて以降ルーティングがヘビーな趣味アプリを書いていない…）
        -   UI Library
            -   Blueprint.js
            -   Material-UI
        -   CSS in JS
            -   styled-components
            -   goober
        -   Utilities
            -   (fp-ts)（TypeScript 用関数型ライブラリだがやややりすぎだと感じるのでお手製ライブラリを使っている）
            -   (jQuery) 今は使っていない
        -   Others
            -   Pixi.js
                -   2D キャンバスの高速化に
            -   discord.js
                -   discord アプリを作った時に
    -   Development Environment
        -   Package manager
            -   npm
        -   Build environment
            -   Webpack
        -   Testing
            -   Jest
        -   Linters & Formatters
            -   ESLint (TypeScript-eslint)
            -   Prettier
                -   [prettier-plugin-organize-imports](https://github.com/simonhaenisch/prettier-plugin-organize-imports#readme) を入れている。
                    これを見つける前は自作スクリプト (https://qiita.com/pikohideaki/items/9f3843853903fcff392c) をプリプロセスで走らせていた。
-   Web backend
    -   Languages
        -   Node.js
        -   PHP（数千行程度） 今は使っていない
        -   MySQL（思い出せば書ける）
    -   BaaS
        -   firebase (hosting, firestore, functions, auth)
        -   Netlify
        -   Heroku
    -   Docker
    -   express(nodejs) （チュートリアルをやっただけ）
-   Others
    -   Languages
        -   C++（数万行オーダー）
            -   大学時代の研究や課題で使っていた。
            -   使用経験があるのは C++11 までで C++14 以降はあまり知らない。
            -   AtCoder に何度か使用した。
        -   Rust（数千行オーダー）
        -   Python3（数千行オーダー）
            -   それほど使い慣れてはいないが、たまに画像処理やデータ分析等で使う。
            -   scikit-learn（ちょっとだけ）
    -   少しだけ使用経験のあるもの
        -   Haskell
        -   Ruby（大学の講義）
        -   Java（就活のコーディングテストで一度だけ）
        -   D
        -   Erlang（卒業研究で少し触った）
        -   Swift（業務で簡素な iOS アプリ構築のため少しだけ書いた）
        -   Scheme（大学の講義で）
        -   PowerPC のアセンブリ（大学の講義で）
    -   [PAST](https://atcoder.jp/contests/past202005-2)
        -   2020-05-25
        -   初級（52 点）（最近あまり使わない C++の構文で引っかかって時間をロスしたりしたので低めかも。そもそも競技プログラミングはあまり得意ではない）

### メモ

-   基本的にウェブフロントエンドに興味があり、バックエンドは比較すると知識が少なめ。趣味でアプリを書くときは BaaS で簡単に済んでしまうのでなかなか書く機会が少ない。
-   今後覚えようかと思いつつあまり触れていないもの
    -   Server Side Rendering, Static Site Generator
    -   GraphQL
    -   Recoil
        -   RxJS で非同期処理も状態管理もできてしまうので個人的にはモチベーションが薄い。
    -   WASM
-   watch list
    -   [deno](https://github.com/denoland/deno)
    -   [Rome](https://github.com/rome/tools)
    -   [Solid](https://github.com/ryansolid/solid)

## 開発環境

-   OS
    -   Windows（メイン。開発は WSL）
    -   macOS（2 年くらい使っていた時期はある）
    -   Linux
-   マシン
    -   ThinkPad X1 Extreme
-   エディタ
    -   VSCode（メイン）
    -   Sublime Text（VSCode の前に使っていた）
    -   vi（サーバーサイドでちょっと書き換えるときとか）
    -   (Emacs)

## 言語（自然言語）

-   日本語（ネイティブ）
-   英語
    -   読み書き：親しみのある分野であれば論文は読める程度。プログラミング関連のドキュメントは普通に読める。
    -   会話：流暢ではないが最低限は使える
