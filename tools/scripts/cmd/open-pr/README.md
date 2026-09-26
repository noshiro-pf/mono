<!-- cspell:ignore unreviewed -->

# `open-pr`

`pnpm run open-pr` — opens the pull request for the current branch the way
this repository wants one opened: held by `skip-ci`, and never armed.

- [日本語](#日本語)
- [English](#english)

The conventions this follows are `CLAUDE.md`'s: "Commits and pull requests"
and "CI". This file describes what the script does with them.

## 日本語

### 何をするスクリプトか

現在のブランチを push し、PR を **ready for review** で作り、**`skip-ci`** を
付けます。この3手順だけです。マージもせず、`merge-queued` も付けず（それは
レビュー後に人が行うことです）、**auto-merge も張りません**。

### auto-merge を張らない理由

`main` の ruleset は `required_approving_review_count: 0` なので、
`.github/CODEOWNERS` が挙げるパスの外では、auto-merge の張られた PR は緑に
なった瞬間にマージされます。レビューが済んでいるかどうかは関係ありません。
stack する PR（下記）ならなおさらで、base は ruleset の掛からないブランチなので、
張った瞬間に下の層のブランチへマージされかねません。

そこで **auto-merge は `unblock-prs` が、`merge-queued` の付いた PR を pick した
ときに張ります**。キューに入れること（ `merge-queued` ）が「マージしてよい」の
合図で、それより前には誰も張りません。`skip-ci` はチェックを止め、
`no-skip-ci-label` でマージも止めておくためのものです。

### 認証情報

GitHub の API を直接叩きます（`gh` は要りません）。トークンは
**`GITHUB_TOKEN` → `GH_TOKEN` → `gh auth token`** の順に探します。コンテナや
runner には前2つが既にあり、`gh` で設定しただけのマシンでは3つ目が拾われるので、
どちらでも何も書き出さずに動きます。どれも無ければその旨を言って止まります。

`gh` を捨てたのは、このコマンドが一番効く場所 — クラウドのコンテナや runner —
が `gh` の入っていない場所だからです。呼ぶ API は `gh` と同じものです。

既存の PR が draft だったときに ready にする操作だけは REST に無いので、GraphQL
の mutation を使います。

**プロキシ配下でも動きます。** Node の `fetch` は `HTTPS_PROXY` を自動では見な
いため、スクリプト側で `NODE_USE_ENV_PROXY=1` を付けています。これが無いと
プロキシを迂回して `401 Bad credentials` になり、トークンの問題に見えます。

### 途中で失敗したら、もう一度実行してください

各ステップは既に済んでいればスキップされます。PR が既にあれば作らず、ラベルが
既にあれば付け直しません。巻き戻す必要はありません。

### 実行

```bash
pnpm run open-pr                                   # 既定
pnpm run open-pr -- --dry-run                      # 何をするかだけ表示
pnpm run open-pr -- --title 'fix: 説明' --body-file ./pr.md
pnpm run open-pr -- --merge-after '#1901'          # 順序を宣言
pnpm run open-pr -- --base feat/lower-layer        # その PR の上に積む
```

| オプション           |                既定 | 意味                                      |
| :------------------- | ------------------: | :---------------------------------------- |
| `--title <text>`     |  直前のコミット件名 | PR タイトル（英語、Conventional Commits） |
| `--body-file <path>` | トレーラのみ / 空欄 | 本文を読むファイル                        |
| `--base <branch>`    |  リポジトリの既定値 | 対象ブランチ（PR のブランチなら stack）   |
| `--merge-after <n>`  |                なし | `Merge-After:` を宣言（複数回可）         |
| `--dry-run`          |                 off | 何も触らずに手順だけ出す                  |

**本文は自分で書くものです。** `skip-ci` が付いている間はローカルで走らせた
チェックがそのブランチの唯一のチェックなので、どれを走らせたかを本文に書いて
ください。`--merge-after` を付けると `Merge-After:` 行が本文の先頭に入ります。

### stacked PR

`--base` に別の open な PR のブランチを渡すと、その PR の上に積んだ PR になり
ます。差分はこの層の分だけになり、`unblock-prs` と各レポートは下の層がマージ
されるまで待つものとして扱います。下の層の番号は `Merge-After:` として本文の
先頭にも自動で入ります（ `--merge-after` を併用すれば同じ行にまとめます）。
ツールは base だけでも stack を読むので、これは順序を本文にも書いておくための
ものです。

- その base を head とする open な PR がこのリポジトリにちょうど1本あること、
  そして現在のブランチが `origin/<base>` の先端を含んでいることを、push の前に
  確かめます。どちらかが違えば何もせずに止まります。
- auto-merge はほかの PR と同じく張りません。`unblock-prs` は下の層がマージされ
  て GitHub がこの PR を既定ブランチに付け替えるまで pick しないので、張られる
  のもそのときです。
- **GitHub のネイティブ stack にはしないでください。** stack は base だけで
  作ります。GitHub はネイティブ stack に入った PR に auto-merge を張らせず、
  下の層がマージされて既定ブランチに付け替えられた後も stack から外さないので、
  `unblock-prs` はその PR を pick せず、手でマージするよう報告します。

### 拒否すること

- 既定ブランチの上にいるとき（先にブランチを切ってください）
- detached HEAD のとき
- 認証情報がどこからも取れないとき
- `--base` が open な PR のブランチでない、または現在のブランチがその先端を
  含まないとき

既存の PR が draft だった場合は ready にします。`unblock-prs` は draft を pick
しないからです。

### この後

レビューが終わったら **`merge-queued` を付けるだけ**です。順番が来ると
`unblock-prs` が rebase して auto-merge を張り、`skip-ci` を外し、緑になった
時点で GitHub がマージします。**auto-merge を手で張らないでください** — それが
未レビューのままマージさせる操作です。

## English

`pnpm run open-pr` pushes the current branch, creates the pull request ready
for review, and adds `skip-ci`. It merges nothing, never adds `merge-queued`,
which is a person's statement that the pull request has been reviewed, and
**never arms auto-merge**.

**Why it arms nothing.** The `main` ruleset asks for
`required_approving_review_count: 0`, so outside the paths `.github/CODEOWNERS`
lists an armed pull request merges the moment it goes green, reviewed or not.
A stacked one (below) is worse off: its base is a branch no ruleset covers, so
armed it could merge into the layer below at once. So **`unblock-prs` arms a
pull request when it picks it**, which it does only once it is labelled
`merge-queued` and onto the default branch: queueing is the signal that it may
merge, and nothing is armed before it. `skip-ci` holds the checks, and with
`no-skip-ci-label` the merge, until then.

It calls the GitHub API directly; `gh` is not required. The token is looked
for in **`GITHUB_TOKEN`, then `GH_TOKEN`, then `gh auth token`** — the first
two are already set in a container or on a runner, and the third picks up a
machine set up with `gh` alone, so neither kind of machine has to export
anything. `gh` was dropped because the places this command is most useful are
the places `gh` is least likely to be installed; the API it calls is the same
one `gh` calls. Taking an existing pull request out of draft has no REST
equivalent and goes through GraphQL.

It works behind a proxy: Node's `fetch` does not read `HTTPS_PROXY` on its
own, so the script sets `NODE_USE_ENV_PROXY=1`. Without that it bypasses the
proxy and fails with `401 Bad credentials`, which reads like a token problem
and is not one.

Every step is skipped when it is already done, so a run that failed part way
through is finished by running it again rather than unpicked.

```bash
pnpm run open-pr                                   # the default
pnpm run open-pr -- --dry-run                      # say what would be done
pnpm run open-pr -- --title 'fix: a thing' --body-file ./pr.md
pnpm run open-pr -- --merge-after '#1901'          # declare an order
pnpm run open-pr -- --base feat/lower-layer        # stack it on that one
```

| option               |                default | meaning                                   |
| :------------------- | ---------------------: | :---------------------------------------- |
| `--title <text>`     |    last commit subject | the title, in English                     |
| `--body-file <path>` |  the trailer, or empty | where to read the body from               |
| `--base <branch>`    | the repository default | what to target; a pull request's stacks   |
| `--merge-after <n>`  |                   none | declare a predecessor; repeat for several |
| `--dry-run`          |                    off | print the steps and touch nothing         |

The description is yours to write: while `skip-ci` is on, the checks you ran
locally are the only checks the branch gets, so say which ones. `--merge-after`
puts the `Merge-After:` line at the top of the body, where `unblock-prs` reads
it.

A `--base` that is another open pull request's branch stacks this one on it:
the diff is its own layer, and `unblock-prs` and the reports treat it as
waiting for the layer below. That layer is also written into the
`Merge-After:` line at the top of the body, first, alongside anything given
with `--merge-after`: the tools read the stack from the base alone, and the
trailer states the order in the body as every other declared order is. Before
pushing, the script checks that exactly one open pull request here is from
that branch and that the current branch contains the tip of `origin/<base>`,
and stops otherwise. `unblock-prs` does not pick it, and so does not arm it,
until the layer below has merged and GitHub has moved it onto the default
branch.

**Do not make it one of GitHub's native stacks**; the base alone is the
stack. GitHub refuses auto-merge on a pull request in a native stack, and
keeps it in the stack after the layer below has merged and it has been moved
onto the default branch, so `unblock-prs` does not pick it and reports it to
be merged by hand.

It refuses to run on the default branch, on a detached HEAD, and without a
credential. An existing pull request that is a draft is marked ready, because
`unblock-prs` does not pick a draft.

Afterwards, queueing it is one action: add `merge-queued` once it has been
reviewed. When its turn comes `unblock-prs` rebases it, arms auto-merge, takes
`skip-ci` off, and GitHub merges it once the checks are green. Arming it by
hand is the action that merges unreviewed work.
