# browser app の `<head>` — favicon・ホーム画面アイコン・リンクカード

<!-- cspell:ignore resvg Noto -->

`apps/*` の browser app（`index.html` を持つ Vite アプリ）が `<head>` に
入れる設定と、その理由。欠けてもビルドは落ちず、タブの既定アイコン、iOS の
ホーム画面に描かれるタイトルの頭文字、X・Slack・Discord で URL を貼ったときに
画像の出ないカードとして、公開後に初めて気づく。そのため
`pnpm run check:root:app-head`（`tools/scripts/cmd/check-app-head.mts`）が
すべての `apps/*/index.html` について、名前を挙げたファイルがあること、公開する
ページが下記を備えることを確かめる。

見本は `apps/task-manager-app/index.html`（GitHub Pages）と
`apps/event-schedule-app/index.html`（Firebase Hosting）。

## 置くもの

| ファイル                      | 用途                                             | 形                                                   |
| :---------------------------- | :----------------------------------------------- | :--------------------------------------------------- |
| `public/favicon.svg`          | ブラウザのタブ                                   | 角丸の正方形、`viewBox="0 0 32 32"`                  |
| `public/apple-touch-icon.png` | iOS の「ホーム画面に追加」                       | 180×180 の不透明 PNG、`favicon.svg` の絵を角丸なしで |
| `public/og-image.png`         | X・Slack・Discord などのリンクカード（OGP 画像） | 1200×630 の PNG、アイコンとアプリ名・説明            |

`<head>` には次を書く。

- `<meta name="description">` — 検索結果とリンクカードの説明文。
- `<meta name="theme-color">` — Discord がカードの左に引く線の色で、Android の
  Chrome ではアドレスバーの色にもなる。アイコンの背景色にする。
- `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`
- `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` と
  `<meta name="apple-mobile-web-app-title">`（ホーム画面のアイコン下に出る名前。
  長いと切れるので 10 文字程度）。
- `og:type`・`og:title`・`og:description`・`og:url`・`og:image`
  （`og:image:width` / `og:image:height` / `og:image:alt` も）・`og:locale` と
  `<meta name="twitter:card" content="summary_large_image">`。

X は `twitter:title` などが無ければ `og:*` を読むので、`twitter:*` は
`twitter:card` だけでよい。

## 公開するアプリとしないアプリ

**`og:url` を持つページを「公開している」とみなす。** 公開するアプリは上記を
すべて備え、`og:url` と `og:image` を絶対 URL で書く。

- GitHub Pages に載せるアプリ（`tools/configs/pages-apps.mts`）は
  `https://noshiro-pf.github.io/mono/<dir>/`。ガードはこの URL であることを
  求める。
- Firebase Hosting に載せるアプリは `.firebaserc` のプロジェクトの
  `https://<project>.web.app/`。デプロイは手で行うので、`.firebaserc` が
  あっても公開しているとは限らない（`algo-app` のサイトは 404。Pages に
  移したアプリの `.firebaserc` は旧 URL からの redirect 用で、ガードは
  Pages の URL を求める）。ガードは `og:url` があるときに限り、このホストであることを求める。
- どこにも公開しないアプリ（playground、開発用サンプル）はタブのアイコン
  だけを置く。共有される URL が無いので、カードもホーム画面のアイコンも要らない。

## 守ること

- **`favicon.svg` は SVG 1 枚にする。** どのサイズでも鮮明で、`.ico` や
  サイズ別 PNG の束（`apple-icon-57x57.png` から `ms-icon-310x310.png`、
  `browserconfig.xml`、`manifest.json`）が要らない。色はテーマに追従させず
  固定する（アイコンが載るのはページではなくブラウザのタブ列なので、白地にも
  黒地にも読める「濃い色の角丸＋白い絵」にする）。手描きのラスター画を
  アイコンにしているアプリ（`profile-app`）だけは PNG を使う。
- **SVG のコメントに `--`（ハイフン 2 つの連続）を書かない。** XML では
  禁止で、ブラウザはファイル全体を拒否してアイコンを出さない。画像
  ビューアでは描けてしまうので気づきにくい（ガードが見る）。
- **`apple-touch-icon.png` は角丸なし・透過なし。** iOS は自分で角を丸め、
  透過部分を黒で塗る。iOS は SVG の favicon を読まず、touch icon が無いと
  タイトルの頭文字を描く。
- **`og:url` と `og:image` は絶対 URL で書く。** クローラーはスクリプトを
  実行せず、ここには絶対 URL を求める。Vite は `og:image` の
  `/og-image.png` に `base` を前置はするが、ホスト名までは付けない。
  `href="/favicon.svg"` のようなリンクは `/` 始まりのままでよい（Vite が
  `base` を前置する）。
- **`public/` に置く。** `src/` に置くとハッシュ付きのファイル名になり、
  `og:image` に書く URL が決まらない。
- リポジトリは公開なので、`og-image.png` に個人の値やスクリーンショットを
  載せない。アプリ名と短い説明で足りる。第三者の絵（ゲームの箱絵など）も
  アイコンやカードに使わない。

## PNG の作り方

```sh
pnpm run gen:app-images -- apps/<name> [apps/<name> ...]
```

`tools/scripts/cmd/gen-app-images.mts` が Playwright（Chromium）で
`favicon.svg` と `index.html` から描く。

- `apple-touch-icon.png` — `favicon.svg` の背景の `rx` を外して 180×180 で。
  `favicon.svg` の無いアプリでは手元の PNG をそのまま使い、描かない。
- `og-image.png` — 1200×630 に、アイコンと `og:title`・`og:description` を
  並べて。文字は Google Fonts の Noto Sans JP で組むので、ネットワークが要る。

絵か `og:title` / `og:description` を変えたときだけ手で実行する（`gen` には
入れない。Chromium やフォントの更新でバイト単位の差分が出るため）。

Astro のサイトは別の作り方をする。`apps/synstate-docs` はロゴ PNG から resvg で
各サイズのアイコンを描く `scripts/gen-icons.mts` と、ページごとに OGP 画像を
描く `src/pages/og/[...slug].png.ts` を持つ。

## 確認

- `pnpm run check:root:app-head`。
- `pnpm run build` のあと `build/index.html` で、アイコンの `href` に `base` が
  付いていること。
- 公開後に `og:image` の URL を直接開いて画像が返ること。X・Slack・Discord は
  カードをキャッシュするので、直したあとはしばらく古いカードが出ることがある。

## 各アプリの状況（2026-10 時点）

| アプリ                                                                                                                                                                                                          | 公開先                   | favicon                   | iOS                             | OGP                                                   |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------- | :------------------------ | :------------------------------ | :---------------------------------------------------- |
| `annotation-tool`, `cant-stop-probability-app`, `catan-dice-app`, `color-demo-app`, `housing-loan-calculator-app`, `lambda-calculus-interpreter-*`, `life-plan-simulator`, `pr-manager-app`, `task-manager-app` | Pages                    | `favicon.svg`             | `apple-touch-icon.png` ＋ title | あり                                                  |
| `profile-app`                                                                                                                                                                                                   | Pages                    | `favicon.png`（手描き）   | `apple-touch-icon.png` ＋ title | あり                                                  |
| `event-schedule-app`                                                                                                                                                                                            | Firebase                 | `favicon.svg`             | `apple-touch-icon.png` ＋ title | あり                                                  |
| `synstate-docs`（Astro）                                                                                                                                                                                        | Pages                    | `.ico` ＋ PNG             | `apple-touch-icon.png` ＋ title | あり（Starlight の `og:*` ＋ページごとの画像）        |
| `synstate-dom-docs`（Astro）                                                                                                                                                                                    | Pages                    | `.ico`（synstate のもの） | `apple-touch-icon.png` ＋ title | Starlight の `og:*` と `theme-color` のみ（画像なし） |
| `algo-app`, `blueprintjs-playground*`, `mahjong-calculator-app`                                                                                                                                                 | なし                     | `favicon.svg`             | なし                            | なし                                                  |
| `synstate-dom-sample-app`                                                                                                                                                                                       | なし（開発サーバーのみ） | `.ico`（synstate のもの） | なし                            | なし                                                  |
