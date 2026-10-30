# pull request のスクリーンショット

ページの見た目を変える pull request は、変更前と変更後のスクリーンショットを
description に載せる。レビューする人が、ブランチを手元で動かさずに差分を見られる
ようにするため。

## 何を撮るか

- 変更前は base ブランチ（たいていは `main`）、変更後は pull request のブランチ。
  同じデータ、同じ幅、同じ URL パラメータで撮り、`before-list.png` と
  `after-list.png` のように対になる名前にする。
- ライトとダーク。レイアウトが変わる変更なら、スマホ幅（390px 程度）も。
- 変わった部分が分かる範囲に切り取る。ページ全体の縦長の画像は読めない。
- 置き場所は公開リポジトリなので、トークン、非公開リポジトリのデータ、
  個人情報が写っていないことを確かめる。

## どこに置くか

GitHub の添付ファイルのアップロードはブラウザからしか使えない。そこで、公開
リポジトリ [`noshiro-pf/mono-screenshots`](https://github.com/noshiro-pf/mono-screenshots)
に push し、そこを参照する。このリポジトリには commit しない。`main` の履歴に
残り続け、clone を重くするだけになる。

- 置き場所は `<pull request の番号>/before-<名前>.png` と
  `<番号>/after-<名前>.png`。
- 参照は commit SHA を固定した URL にする:
  `https://raw.githubusercontent.com/noshiro-pf/mono-screenshots/<sha>/<番号>/<ファイル名>`。
  ブランチ名を指すと、後の push で過去の pull request の画像が差し替わる。
- 番号は pull request を開くまで決まらない。`open-pr` の後に push し、
  description を GitHub API で更新する。amend で見た目が変わったら撮り直して
  同じディレクトリに push し、下の表を出し直して差し替える。

description には、画像そのものを before / after の表にして載せ、開かなくても
見えるようにする。そのうえで各画像を、同じ SHA で開くビューアへのリンクにし、
表の上に全体へのリンクを置く。表は push した後に生成する:

```sh
pnpm run --silent pr-screenshots -- <番号>
```

`<番号>/` を最後に変えた `main` の commit を使うので、撮り直して push した後に
もう一度実行すれば、差し替える表が出る。commit を固定したいときは 2 つ目の
引数に渡す。`before-<名前>` と `after-<名前>` を 1 行に組にし、どちらの接頭辞も
無い画像は表の後に並べる。ファイル名に空白・`#`・`%` のような URL で符号化の
要る文字があると、名前を挙げて止まる。

リンクで包まないと、GitHub は画像ごとに素の PNG を新しいタブで開くリンクを
付ける。ビューア（mono-screenshots の `index.html`）はその pull request の画像を
1 つのタブに並べ、組ごとに並べて、または同じ位置で切り替えて見せ、矢印キーで
送れるようにする。GitHub は書いたリンクを同じタブで開くので、pull request へは
「戻る」で帰る。一覧はトークン無しの GitHub API（IP ごとに 1 時間 60 回）から
取り、使い切るとリンク先の 1 組だけを見せる。

push には `GH_TOKEN` を使う。git の credential helper が別の資格情報を持って
いると 403 になるので、ヘッダで渡す。コマンドラインに置くとプロセス一覧から
読めるので、環境変数で渡す:

```sh
auth=$(printf 'x-access-token:%s' "$GH_TOKEN" | base64 | tr -d '\n')
GIT_CONFIG_COUNT=2 \
  GIT_CONFIG_KEY_0=credential.helper GIT_CONFIG_VALUE_0= \
  GIT_CONFIG_KEY_1=http.https://github.com/.extraheader \
  GIT_CONFIG_VALUE_1="AUTHORIZATION: basic $auth" \
  git push origin HEAD:main
```

どのセッションも同じ `main` に push する。先に別のセッションが push していて
拒否されたら、`git pull --rebase origin main` してから push し直す。force-push は
しない。

`GH_TOKEN` の fine-grained token には、このリポジトリの「Contents: Read and
write」が要る。

## 撮り方

アプリを `pnpm run dev` で起動し（ポートは `tools/configs/app-dev-ports.mts`）、
Playwright で撮る。変更前は、base ブランチを別の worktree で起動するか、
変更を入れる前に撮っておく。
