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
クローラーはスクリプトを実行しないので、イベントごとにイベント名入りの
`og:title` を返すには、Hosting の rewrite から Cloud Functions（または SSR）に
渡すしかない。

**利用者がいて、将来サーバー側の機能が要りそうなアプリも、最初から Firebase
Hosting に置く。** Pages からは出ていくのが難しい（下の「Pages から出るとき」）。
`event-schedule-app` は両方に当たる（イベントごとの OGP を予定しており、
共有済みのイベント URL と通知メールのリンクがある）ので、Firebase Hosting に
置く。

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
  （`tools/configs/vite-app-config.mts` の `routePaths`。アプリは画面のパスの
  一覧を 1 か所に持ち、ルーティングと Vite の設定の両方がそれを読む）。
- **ID のような動的な値は query** に置く（例: `algo-app` の `/rooms/?id=<id>`、
  `/cashflow/?plan=<id>`）。数が無限なのでパスごとの複製はできない。
- 編集のような別画面は、真偽値の query（`?edit=true`）にせず、パス
  （`/plan/edit/?id=<id>`）か列挙の query（`?mode=edit`）にする。モードが
  増えたときに真偽値の組み合わせは破綻する。

複製した `index.html` は同じ内容で、JS と CSS はハッシュ付きの同じファイルを
参照する。アプリはそのまま SPA で、タブなどの遷移は `history.pushState` で行い
ページを読み直さない（profile で測ったところ、タブの切り替えでリクエストは
0 件）。複製が返るのはそのパスを直接開いた・再読み込みしたときだけで、
サーバー側のリライトと同じ働きをする。

base path は `tiny-router-observable` の `createRouter({ basePath:
import.meta.env.BASE_URL })` で扱い、アプリは root にいるつもりでルーティング
する。`<a href>` はブラウザがオリジンから解決するので、リンクには base を
付けた URL を書く（`prependBasePath`）。

## Pages から出るとき

Pages には、サーバー側で 301 を返す設定（Firebase の `redirects`、Netlify の
`_redirects` の類）が無い。Pages から別のホストへ移したあとも
`noshiro-pf.github.io/mono/<dir>/…` を生かす手段は次の 2 つで、どちらも
Firebase Hosting から出るときより劣る。

- **転送用のページを Pages に残し続ける。** 各パスの `index.html` を、
  `<meta http-equiv="refresh">` と、パス・query・hash を引き継いで
  `location.replace()` する JS だけのページに差し替える。ブラウザで開く人には
  効き、Google は待ち時間 0 の meta refresh を恒久的な転送として扱う。ただし
  HTTP の 301 ではなく、JS を実行しないクローラー（X・Slack などのリンク
  カード）が見るのは転送ページ自身になる。転送ページは静的ファイルなので、
  このリポジトリの Pages のデプロイに置き続ける。
- **独自ドメインを使う。** URL がホストから独立するので、移転は DNS の
  付け替えで済み、redirect が要らない。根本的な対策だが、Pages の独自ドメインは
  サイト（リポジトリ）単位なので、mono の全アプリの URL がまとめて変わる。
  設定すると GitHub が `noshiro-pf.github.io/mono/…` から転送するはずだが、
  project サイトでの挙動と、DNS を別のホストに向けたあとも転送が続くかは
  確かめていない。

だから、利用者がいて移転の可能性があるアプリを Pages に置くのは避ける（上の
基準）。利用者のいないデモや、URL が共有されないアプリは Pages でよい。

## 今の割り当て

| 公開先                                  | 対象                                                                                                |
| :-------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| Pages（`tools/configs/pages-apps.mts`） | `apps/` の 12 アプリ（一覧は `pages-apps.mts`）                                                     |
| Pages（`/mono/slides/<deck>/`）         | `docs/reveal-slides/` と `docs/marp-slides/` のスライド（`tools/scripts/cmd/build-pages-site.mts`） |
| Firebase Hosting                        | `event-schedule-app`                                                                                |
| 公開しない                              | `blueprintjs-playground*`、`mahjong-calculator-app`、`synstate-dom-sample-app`（開発用・未公開）    |

- **`event-schedule-app`** は上の基準で Firebase Hosting に置く。パスに ID を
  持つルーティング（`/event/<id>/`）のままでよい。Hosting の rewrite が
  index.html を返し、イベントごとの OGP もその rewrite から Functions に渡して
  実装できる。
- **`algo-app`** は利用者がおらず公開もしていなかったので、room の ID を query に
  移して（`/rooms/?id=<id>`）Pages に載せた。
- **`life-plan-simulator`** は今はルーティングを持たない。plan やタブを URL に
  持たせるときは上の URL 設計に従い、Pages のまま載せる。

## Firebase Hosting から移したもの

移したアプリとスライドは、移行期間のあいだ Firebase の project を残し、旧 URL
（`*.web.app`）から Pages への 301 redirect だけを一度デプロイする。
そのための `firebase.json` と `.firebaserc` はアプリやスライドのディレクトリに
置き、project を削除するときに同じ変更で両方消す。redirect は同じパスへの
catch-all が基本で、URL の形を変えたものがあれば、その前に個別の規則を置く。

Firebase をバックエンドとして使い続けるアプリ（`algo-app`、
`life-plan-simulator`、`task-manager`）の `firebase.json` は Firestore と
エミュレータの設定を持ち、`hosting` は持たない。`algo-app` は公開していなかった
ので、`hosting` は redirect を置かずに消した。

`pnpm run check:root:firebase-redirects` が、Pages に載るものの `firebase.json`
が redirect 以外を host していないこと（規則はどれも Pages の URL の中への
301 で、最後が catch-all）と、2 つのファイルが対で揃っていることを確かめる。

Firebase に残るアプリ（Hosting・Functions・セキュリティルール）の自動デプロイは
#2160。
