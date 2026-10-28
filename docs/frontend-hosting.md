# browser app をどこにデプロイするか — GitHub Pages と Firebase Hosting

`apps/*` の browser app と `docs/` のスライドを、どこで公開するかの基準。
#2161・#2576 で Firebase Hosting から GitHub Pages へ移したときの判断をまとめた。

## 基準

**既定は GitHub Pages**（`https://noshiro-pf.github.io/mono/<dir>/`）。
`main` への push ごとに `.github/workflows/deploy-pages.yml` が自動で公開し、
フロントエンドの公開先が 1 か所にまとまり、Firebase CLI のトークンも要らない。

**Firebase Hosting にするのは、URL ごとにサーバー側で応答を変える必要がある
アプリだけ。** Pages は静的ファイルを置くだけで、リライト・ヘッダ・関数を
持たない。代表は、リソースごとの OGP（リンクカード）を出し分けたいとき。
クローラーはスクリプトを実行しないので、`/event/<id>/` にイベント名入りの
`og:title` を返すには、Hosting の rewrite から Cloud Functions（または SSR）に
渡すしかない。

Firestore・Auth・Functions を使うことは、Firebase Hosting にする理由に
ならない。通信先はページの配信元に関係なく同じで、速度にも差は出ない。
Pages に載せたアプリが Firebase をバックエンドに使う例が
`life-plan-simulator` と `task-manager`。

- サインインはポップアップで行う。ページ（`noshiro-pf.github.io`）と認証ドメイン
  （`<project>.firebaseapp.com`）が別のため、リダイレクト方式は Safari の
  ストレージ分離で失敗する（`apps/task-manager/README.md`）。
- Authentication の承認済みドメインに `noshiro-pf.github.io` を入れる。
- バックエンドとフロントエンドのデプロイ時期はずれる。それは許容する。

## Pages に載せるアプリの URL 設計

Pages にはリライトが無い。存在しないパスを開くと、サイト全体で 1 つしか
置けない `/mono/404.html` になる。そのため：

- **画面の種類（有限）はパス**にし、ビルド時に `index.html` を各パスへ複製する
  （`apps/profile/configs/vite.config.mts` の `routeEntryPages`）。
- **ID のような動的な値は query** に置く（例: `/event/?id=<id>`、
  `/cashflow/?plan=<id>`）。数が無限なのでパスごとの複製はできない。
- 編集のような別画面は、真偽値の query（`?edit=true`）にせず、パス
  （`/event/edit/?id=<id>`）か列挙の query（`?mode=edit`）にする。モードが
  増えたときに真偽値の組み合わせは破綻する。

複製した `index.html` は同じ内容で、JS と CSS はハッシュ付きの同じファイルを
参照する。アプリはそのまま SPA で、タブなどの遷移は `history.pushState` で行い
ページを読み直さない（profile で測ったところ、タブの切り替えでリクエストは
0 件）。複製が返るのはそのパスを直接開いた・再読み込みしたときだけで、
サーバー側のリライトと同じ働きをする。複製を使うアプリが 2 つ目になったら、
この plugin を `tools/configs/vite-app-config.mts` の共通オプションに移す。

base path は `tiny-router-observable` の `createRouter({ basePath:
import.meta.env.BASE_URL })` で扱い、アプリは root にいるつもりでルーティング
する。

## 今の割り当て

| 公開先                                  | 対象                                                                                                |
| :-------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| Pages（`tools/configs/pages-apps.mts`） | `apps/` の 11 アプリ（一覧は `pages-apps.mts`）                                                     |
| Pages（`/mono/slides/<deck>/`）         | `docs/reveal-slides/` と `docs/marp-slides/` のスライド（`tools/scripts/cmd/build-pages-site.mts`） |
| Firebase Hosting                        | `event-schedule-app`、`algo-app`                                                                    |
| 公開しない                              | `blueprintjs-playground*`、`mahjong-calculator-app`、`synstate-dom-sample-app`（開発用・未公開）    |

- **`event-schedule-app`** はイベントごとの OGP 出し分けを予定しているので、
  パスによるルーティングのまま Firebase Hosting に残す。
- **`algo-app`** は `/rooms/<roomId>/` をパスで持つので、今は Firebase Hosting に
  残す。サーバー側の応答が要るわけではないので、room の ID を query に移せば
  Pages に移せる。
- **`life-plan-simulator`** は今はルーティングを持たない。plan やタブを URL に
  持たせるときは上の URL 設計に従い、Pages のまま載せる。

## Firebase Hosting から移したもの

移したアプリとスライドは、移行期間のあいだ Firebase の project を残し、旧 URL
（`*.web.app`）から Pages の同じパスへの 301 redirect だけを一度デプロイする。
そのための `firebase.json` と `.firebaserc` はアプリやスライドのディレクトリに
置き、project を削除するときに同じ変更で両方消す。
`pnpm run check:root:firebase-redirects` が、Pages に載るものの `firebase.json`
が redirect 以外を host していないこと、2 つのファイルが対で揃っていることを
確かめる。

Firebase Hosting に残すアプリの自動デプロイは #2160。
