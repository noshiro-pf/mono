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
  同じディレクトリに push し、新しい SHA の URL に差し替える。

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
