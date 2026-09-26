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

## environments

**environment は、それを名指すワークフローをマージする前に宣言して `apply`
すること。** ワークフローが参照していて存在しない environment は GitHub が
その場で作る — 保護ルールも deployment branch policy も無い状態で。そして
それを知らせるものは何も無い。publish が `main` に限られているのは
`release` の branch policy ひとつによる。

## rulesets/main.json

- **ジョブやワークフローを増やしたら、その集約コンテキストをここに足す。**
  足さなければ、動きはするが何も止めない。マトリクスのエントリを増やす分には
  何も要らない。required にしてあるのは `*-result` の集約だけで、実作業をする
  ジョブは一つも入っていない。理由は `CLAUDE.md` の「CI」節。
- **ここに書いてあってどのワークフローも報告しないコンテキストは、いつまでも
  「 Expected — waiting 」のまま。** 改名するときは ruleset bypass でマージし、
  `pnpm run repo-settings:apply rulesets` を実行し、そのあと open な pull
  request が rebase されるまで全部 blocked に見えることを見込んでおく。
- **squash merge が必須で、admin の bypass は `pull_request` モードだけ。**
  bypass を広げないこと。直接 push を検査するものは無い。
- `.github/CODEOWNERS` を通知リストではなくマージゲートにしているのは
  `require_code_owner_review`。そこに挙がったパスでは `pnpm-update` の
  auto-merge が止まる — それが狙いで（ あの App token は `workflows: write`
  を持つ ）、owner 自身の pull request もそのパスでは ruleset bypass で
  マージすることになる理由でもある。どのパスを挙げ、どのパスをあえて挙げて
  いないかは `.github/CODEOWNERS` 自身に書いてある。

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
