# browser app の `<head>` — favicon・ホーム画面アイコン・リンクカード

<!-- cspell:ignore resvg -->

`apps/*` に browser app（`index.html` を持つ Vite アプリ）を作ったときに
`<head>` へ入れる設定と、その理由。どれも欠けてもビルドもチェックも落ちず、
タブの既定アイコン、iOS のホーム画面に描かれるタイトルの頭文字、X や Slack で
URL を貼ったときにカードが出ないこととして、公開後に初めて気づく。

見本は `apps/life-plan-simulator/index.html`（下記をすべて備える）。

## 置くもの

| ファイル                      | 用途                                             | 形                                                   |
| :---------------------------- | :----------------------------------------------- | :--------------------------------------------------- |
| `public/favicon.svg`          | ブラウザのタブ                                   | 角丸の正方形、`viewBox="0 0 32 32"`                  |
| `public/apple-touch-icon.png` | iOS の「ホーム画面に追加」                       | 180×180 の不透明 PNG、`favicon.svg` の絵を角丸なしで |
| `public/og-image.png`         | X・Slack・Discord などのリンクカード（OGP 画像） | 1200×630 の PNG、アイコンとアプリ名                  |

`<head>` には次を書く。

- `<meta name="description">` — 検索結果とリンクカードの説明文。
- `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`
- `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` と
  `<meta name="apple-mobile-web-app-title">`（ホーム画面のアイコン下に出る名前。
  長いと切れるので 10 文字程度）。
- `og:type`・`og:title`・`og:description`・`og:url`・`og:image`
  （`og:image:width` / `og:image:height` も）と
  `<meta name="twitter:card" content="summary_large_image">`。

X は `twitter:title` などが無ければ `og:*` を読むので、`twitter:*` は
`twitter:card` だけでよい。

## 守ること

- **`favicon.svg` は SVG 1 枚にする。** どのサイズでも鮮明で、`.ico` や
  サイズ別 PNG の束が要らない。色はテーマに追従させず固定する（アイコンが
  載るのはページではなくブラウザのタブ列なので、白地にも黒地にも読める
  「濃い色の角丸＋白い絵」にする）。
- **SVG のコメントに `--`（ハイフン 2 つの連続）を書かない。** XML では
  禁止で、ブラウザはファイル全体を拒否してアイコンを出さない。画像
  ビューアでは描けてしまうので気づきにくい。
- **`apple-touch-icon.png` は角丸なし・透過なし。** iOS は自分で角を丸め、
  透過部分を黒で塗る。iOS は SVG の favicon を読まず、touch icon が無いと
  タイトルの頭文字を描く。
- **`og:url` と `og:image` は絶対 URL で書く。** クローラーはスクリプトを
  実行せず、ここには絶対 URL を求める。Vite は `og:image` の
  `/og-image.png` に `base` を前置はするが、ホスト名までは付けない。GitHub Pages に載せる
  アプリなら `https://noshiro-pf.github.io/mono/<dir>/`（`<dir>` は
  `tools/configs/pages-apps.mts` の値）を書く。`href="/favicon.svg"` のような
  リンクは `/` 始まりのままでよい（Vite が `base` を前置する）。
- **`public/` に置く。** `src/` に置くとハッシュ付きのファイル名になり、
  `og:image` に書く URL が決まらない。
- リポジトリは公開なので、`og-image.png` に個人の値やスクリーンショットを
  載せない。アプリ名と短い説明で足りる。

## PNG の作り方

`favicon.svg` から描く。手元のブラウザで書き出してもよいが、Playwright
（Chromium）でページに `<img>` として SVG を置き、`page.screenshot` で撮るのが
簡単で、フォントも使える。

- `apple-touch-icon.png` は `favicon.svg` の `rx` を 0 にしたものを
  180×180 のビューポートで撮る。
- `og-image.png` は 1200×630 のビューポートに、アイコンとアプリ名・説明を
  並べて撮る。

`apps/synstate-docs` はロゴ PNG から resvg で各サイズを描く
`scripts/gen-icons.mts` を持つ。アイコンを複数サイズ作る必要があるときは
そちらを参考にする。どちらの方法でも、出力は絵が変わったときだけ作り直す
（`gen` には入れない。描画ライブラリの更新でバイト単位の差分が出るため）。

## 確認

- `pnpm run build` のあと `dist/index.html` で、アイコンの `href` に `base` が
  付いていること、`og:url` / `og:image` が絶対 URL であることを見る。
- 公開後に `og:image` の URL を直接開いて画像が返ること。X・Slack は
  カードをキャッシュするので、直したあとはしばらく古いカードが出ることがある。

## 既存アプリの状況（2026-10 時点）

| アプリ                                                                                                                             | favicon                                    | iOS                             | OGP / X                                            |
| :--------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------- | :------------------------------ | :------------------------------------------------- |
| `life-plan-simulator`                                                                                                              | `favicon.svg`                              | `apple-touch-icon.png` ＋ title | あり（`summary_large_image`、1200×630）            |
| `task-manager-app`, `pr-manager-app`                                                                                               | `favicon.svg`                              | `apple-touch-icon.png` ＋ title | なし                                               |
| `synstate-docs`（Astro）                                                                                                           | `.ico` ＋ PNG（`gen-icons.mts`）           | `apple-touch-icon.png` ＋ title | あり（Starlight の `og:*` ＋ページごとの画像）     |
| `synstate-dom-docs`（Astro）                                                                                                       | `favicon.ico`                              | なし                            | Starlight の `og:*` のみ（画像なし）               |
| `catan-dice-app`                                                                                                                   | 生成サービスの一式（`.ico`・サイズ別 PNG） | `apple-icon-*.png` 9 サイズ     | あり（画像が相対 URL の 96×96 で、カードに出ない） |
| `event-schedule-app`                                                                                                               | 同上                                       | 同上                            | あり（`summary`、絶対 URL）                        |
| `algo-app`, `cant-stop-probability-app`, `housing-loan-calculator-app`, `lambda-calculus-interpreter-*`, `my-portfolio-app-preact` | 同上                                       | 同上                            | なし                                               |
| `blueprintjs-playground*`, `mahjong-calculator-app`（Vite の既定 `vite.svg`）                                                      | `.ico` / 既定                              | なし                            | なし                                               |
| `annotation-tool`, `color-demo-app`, `synstate-dom-sample-app`                                                                     | なし                                       | なし                            | なし                                               |

古いアプリの「生成サービスの一式」（`apple-icon-57x57.png` から
`ms-icon-310x310.png`、`browserconfig.xml`、`manifest.json`）は、今のブラウザ
では `favicon.svg` と 180×180 の `apple-touch-icon.png` 1 枚で足りる。
新しいアプリでは真似しない。
