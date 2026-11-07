# repo-settings

このリポジトリの GitHub 設定を JSON で宣言してある。読むのは
[`github-settings-as-code`](../libs/github-settings-as-code/README.md) で、
コマンドと対象ファイルの対応はそちらの README にある。個別の宣言に付く注記は
その隣（ `variables/README.md` ）に置く。

**ここのファイルを編集しても CI は通り、何も変わらない。** 宣言が GitHub に
届くのは、誰かが admin トークンで `pnpm run repo-settings:apply` を手で実行
したときだけ。適用するワークフローは無く、未適用であることを知らせるものも
無い。

`pnpm run repo-settings:backup` は逆向きで、GitHub の現在値でこれらのファイルを
撮り直す。差分は private の `noshiro-pf/mono-security` から毎日照合されている
ので、**何も考えずにコミットした `backup` は、ドリフトを黙って宣言そのものに
変えてしまう。** コミットする前に差分を読むこと。

`backup` が消すのは各ディレクトリ直下の `*.json` だけなので、この README は
残る（ CLI の `clear-json-files.mts` ）。

新しい ruleset の宣言は `"id": 0` で書き、**マージする前に**、 `main` に
追いついたその pull request のブランチから `pnpm run repo-settings:apply rulesets`
を実行して、 GitHub が付けた id を同じ pull request に入れる。 `apply` は既存の id に無いものを作成してファイルを書き戻すので、
`id: 0` のまま `main` に入ると、次の `apply` がもう一度作ろうとする。

## environments

**environment は、それを名指すワークフローをマージする前に宣言して `apply`
すること。** ワークフローが参照していて存在しない environment は GitHub が
その場で作る — 保護ルールも deployment branch policy も無い状態で。そして
それを知らせるものは何も無い。publish が `main` に限られているのは
`release` の branch policy ひとつによる。

## rulesets/main.json

- **ジョブやワークフローを増やしたら、その集約コンテキストをここに足す。**
  足さなければ、動きはするが何も止めない。マトリクスのエントリを増やす分には
  何も要らない。required にしてあるコンテキストは、集約ジョブ（`*-result`）か、
  リポジトリのコードを走らせないもの（`no-skip-ci-label` の commit status と
  `lint-pull-request.yml` の 4 つのジョブ）のどちらかで、作業そのものをする
  ジョブは一つも入っていない。理由は `.github/workflows/README.md` の
  「The aggregate job」と `CLAUDE.md` の「CI」節。
- **ここに書いてあってどのワークフローも報告しないコンテキストは、いつまでも
  「 Expected — waiting 」のまま。** 改名するときは ruleset bypass でマージし、
  `pnpm run repo-settings:apply rulesets` を実行し、そのあと open な pull
  request が rebase されるまで全部 blocked に見えることを見込んでおく。
- **squash merge が必須で、admin の bypass は `pull_request` モードだけ。**
  bypass を広げないこと。直接 push を検査するものは無い。
- **`require_code_owner_review` は `false` のままにする。** `.github/CODEOWNERS`
  をマージゲートにしているのは ruleset ではなく、必須チェック
  `Validate code owners`（`lint-pull-request.yml` の `code-owners` ジョブ）。挙がったパスを触る pull request は、作り手が
  所有者であるか、所有者が head を approve していなければ赤になる。ruleset の
  規則は作り手を区別できず、作者は自分の pull request を approve できないので、
  `true` にすると owner 自身の pull request がそのパスでは毎回 ruleset bypass
  でしかマージできなくなる。守りたい相手は bot（ `pnpm-update` の App token は
  `workflows: write` を持つ ）と外部の pull request。どのパスを挙げ、どの
  パスをあえて挙げていないかは `.github/CODEOWNERS` 自身に書いてある。

- **stacked pull request の中間層（ base が `main` でない PR ）には ruleset を
  掛けない。** 掛けられるのは required status checks か pull request ルール
  だが、どちらもそのブランチへの push そのものに効くので、amend や積み直しの
  たびに force-push される層のブランチが push できなくなる。中間層を守って
  いるのは「誰も auto-merge を張らない」ことで、`open-pr` はどの PR にも張らず、
  `unblock-prs` は pick した PR にだけ張る。層が pick されるのは GitHub が
  `main` に付け替えた後で、そこから先はこの ruleset が掛かる。理由の詳細は `.github/workflows/README.md` の
  「The gate」。

## rulesets/restrict-deletion.json

`archive/**` の削除を禁じる。 bypass_actors は空なので、admin も
`GITHUB_TOKEN` も消せない。

## rulesets/queue-branches.json

`refs/heads/queue/**/*` の作成・更新・削除を、 admin ロール（ actor_id 5 ）以外に
禁じる。
`unblock-prs` は先回りの検査層を `queue/pr-<番号>` に積み、 `check-gates.yml`
は `diff-parent` の判定を `queue/*` ブランチの上でだけ使い回す。その判定を
信用してよいのは、この接頭辞を書けるのが queue だけだからで、接頭辞を変える
ときは `queue-tags.json`、 `check-gates.yml`、 `speculate-plan.mts` の
`LAYER_BRANCH_PREFIX` も揃えて変える。

- **bypass を admin ロールにしているのは、 worker が作者のチェックアウトから
  作者の git 認証で `git push` するから。** API 呼び出しに使うトークン
  （ `GH_TOKEN` → `GITHUB_TOKEN` → `gh auth token` ）ではない。個人リポジトリの
  ruleset はユーザー個人を bypass に挙げられないので、 admin として push する
  ものはすべて通る。止まるのはワークフローの `GITHUB_TOKEN`、 bot の App token、
  admin でない共同作業者。 queue を専用の GitHub App で動かすようになったら、
  bypass をその `Integration` に替える。
- **admin でない git 認証で worker を動かすと、層の push も削除も拒否される。**
  worker はそれをログに一行出すだけで（ push は「この巡回では積まなかった」、
  削除は `Cannot delete` ）、一件ずつの検査に戻る。先回りの検査が始まらない
  とき、古い `queue/pr-*` が残り続けるときは、まず push の認証を疑う。
- **`bypass_mode` は `always`。** `pull_request` にすると、 queue の
  force-push そのものが拒否される。

## rulesets/queue-tags.json

`refs/tags/queue/**/*` のタグを、誰にも作らせない（ bypass_actors は空）。
worker は層の検査を `queue/pr-<番号>` という短い名前で dispatch するので、
同じ名前のタグがあると、ブランチではなくそちらが選ばれうる。止めるのは作成
だけで、適用前からあったタグは消せる。
