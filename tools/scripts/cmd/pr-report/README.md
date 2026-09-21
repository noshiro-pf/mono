# `pr-report`

`pnpm run pr-report` — the state of every open pull request, in one page.

- [日本語](#日本語)
- [English](#english)

The conventions this reads are `CLAUDE.md`'s: "Required status checks",
"Triggers, `skip-ci`, out-of-date branches" and the `Merge-After:` trailer
described in `tools/scripts/cmd/unblock-prs/README.md`. This file describes
what the script does with them.

## 日本語

### 何をするスクリプトか

open な PR を1件ずつ調べ、**読むだけ**でレポートを出力します。ラベル操作・
rebase・マージ・コメントは一切しません（それは `unblock-prs` の仕事です）。読む
だけなので、スケジュール実行でも、read-only トークンでも、トークン無しでも安全に
動きます。

出力に載るのは、GitHub の PR 一覧では1画面で分からないものだけです。

- **マージ順** — `Merge-After:` トレーラが宣言するのはグラフですが、PR 一覧では
  4本の stack が無関係な4行に見えます。木として描けば、上にあるものが次に見る
  ものです。
- **閉じる issue** — body を開かずに「これは何のための PR か」が分かるように。
- **ラベル** — `skip-ci` と `merge-queued` はこのリポジトリの「まだ」と「準備
  完了」そのものです。
- **auto-merge** — ラベルは依頼、auto-merge は機構で、この2つはズレ得ます。
  `merge-queued` が付いているのに auto-merge が無い PR を `unblock-prs` は
  「auto-merge is not enabled」として見送るので、そこに `no auto-merge` と出し
  ます。news のときだけ言う項目で、誰もキューに入れていない PR については黙り
  ます。
- **ruleset が要求する context の判定** — 「走ったチェック」とは別物です。何も
  報告していない required context は永久に "Expected — waiting" のまま出ますし、
  赤い aggregate は何が落ちたかを名乗りません。どちらも名指しで出します。
- **base との ahead / behind** — behind な branch は何も走らず何もマージされま
  せん。PR ページはそれを文章で言うだけで、差の大きさは言いません。
- **直近マージされた PR** — キューの話ではない唯一の節で、日次レポートの読者が
  最初に持つ疑問（昨日キューに入れたものは入ったのか）に答えます。

### 実行

```bash
pnpm run pr-report                      # 端末向け（既定）
pnpm run pr-report -- --format markdown # GitHub issue / Claude 向け
pnpm run pr-report -- --format payload  # ページが読む JSON
pnpm run pr-report -- --format json     # 他のツールに渡す（body 込みの全体）
pnpm run pr-report -- --repo owner/name # 別のリポジトリ
pnpm run pr-report -- --merged-days 3   # 「直近マージ」の遡る日数
pnpm run pr-report -- --merged-limit 5  # その最大件数
pnpm run pr-report -- --format markdown --payload-file out.json # 1回で両方
```

`--merged-days`（既定 7）と `--merged-limit`（既定 20）は日数と件数の両方から
掛かります。上限は「入らないから」ではなく「読めなくなるから」で、20件を超えた
あたりからこのセクションは一覧ではなく履歴になります。出力先はファイルなので
文字数の上限はありません。

### トークン

`GITHUB_TOKEN` か `GH_TOKEN` があれば使い、無ければ無認証で読みます。mono は
public なので無認証でも動き、1回のレポートは匿名の 60 requests/hour に収まりま
す（PR 1本あたり約3リクエスト = 20本程度まで）。workflow は `github.token` を
渡すので、この上限は手元で無認証に走らせたときの話です。

トークンがあると変わるのは2点だけです。レート制限が 5000/hour になることと、
閉じる issue を GraphQL の `closingIssuesReferences`（サイドバーで手動リンクした
ものを含む、GitHub 自身のリスト）から読むこと。無認証のときは body の
`Closes #12` 等のキーワードから読むので、手動リンクは見えません。その旨はレポート
の末尾に自分で書きます。

### 判定の決まりごと

- **required context の一覧は `repo-settings/rulesets/main.json` から読みます。**
  ruleset を返す API は admin トークンを要求しますし、そのファイルが desired
  state だからです。ただし root のファイルは `pnpm run repo-settings:apply` を
  実行するまで GitHub には効かないので、適用前に足した context は全 PR で
  missing として出ます — レポートがそう言うのは正しい挙動です。
- **`skipped` は合格です。** gated job は `skip-ci` のときと workflow が読まない
  diff のときに skip し、GitHub はそれを満たされたものとして扱います。
- **`skip-ci` は `paused`** という独立の判定にしています。ラベルが付いている間、
  見えている赤はラベルが付く前のもの — 典型的には `labeled` run に取り消された
  `opened` run の残骸 — なので、`failing` と呼ぶとキューに入った PR が全部壊れて
  見えます。名前は `stale red:` として残します。
- **`no-skip-ci-label` は check run ではなく commit status** です。両方の
  エンドポイントを読むのはそのためで、片方だけだと全ての labelled な PR を
  止めている context が missing に見えます。同名の check run と commit status
  が両方ある場合は、**厳しい方**を採ります — GitHub は「both must pass」と
  規定しているので、緑の status が同名の赤い check run を覆い隠すことは
  ありません。
- **同名の check run が複数あるときは、id が最大の check suite のものを採ります**
  — 一番新しく始まった run でも、一番新しく終わった run でもありません。GitHub
  がそう解決するからです。1回の push が作る suite は全て同じ秒に作られるので、
  どれが大きい id を得るかは運で、取り消された `opened` run の suite が勝つと、
  後から緑になった方があっても**その赤が実際にマージを止めます**。
  `started_at` で並べ替えると、止まっている PR を緑と報告することになります。

### 限界

- 1ページ（100件）しか読みません。それを超えたら数えるのをやめて失敗します。
  半分を全体として報告しないためです。
- 手動リンクの issue はトークン無しでは見えません（上記）。
- cycle は描かずに名指しで報告します。cycle の members は木に出てきません。

### 出力先

スクリプトは stdout に出すだけです。配信は2つ。

- `.github/workflows/pr-report.yml` が実行し、`data/pr-report` ブランチを
  上書きします（通知もタイムラインも増えません）。同じ本文が run summary にも
  出ます。
- Claude の routine が同じコマンドを実行して結果を貼ります。そのまま
  `/unblock-prs` に繋げられるのが、読むだけのレポートとの違いです。

`data/pr-report` ブランチに2つのファイルが置かれます。`pr-report.json` を読むの
が **GitHub Pull Requests Manager**
（<https://noshiro-pf.github.io/mono/pr-manager/>, `apps/pr-manager-app`）、
`pr-report.md` は同じレポートの散文で、GitHub がそのままレンダリングします。

以前は issue に書いていました。issue は人が読んで購読するものであって簡易DBで
はない、というのが移した理由です。issue が持っていて惜しかった唯一の性質 —
「現在の状態が固定 URL で人に読める」— は `pr-report.md` がそのまま引き継ぎ、
代わりに publish job から `issues: write` と `gh` が消えました。詳細は
`apps/pr-report-payload/README.md`。

**1回の実行で両方を出します。** workflow は `--format markdown` と
`--payload-file` を同時に渡します。2回実行すると API を倍使い、しかも2つの
ファイルがその間に起きたことの分だけ違う瞬間を指してしまいます。

workflow は2つの job に分かれています。`report` は依存ツリーを走らせますがトー
クンを持たず、成果物を artifact で渡すだけ。`publish` はトークンを持ちますが
checkout も install もせず、`git` と `gh` だけを inline で叩きます。
`pnpm-update.yml` と同じ分け方で、理由も同じです。

workflow が走るのは、**レポートの内容を変えうることが起きたとき**です。PR の
open / close / reopen、body と title の編集（`Merge-After:` と closing keyword
がそこにあるため）、ラベルの着脱、push、draft の切り替え、`main` への push
（全 PR の ahead / behind が同時に動くので）、そして**必須 context を出す7つの
workflow の完了**。加えて毎日 07:00 JST の schedule と `workflow_dispatch`。

最後のものは `workflow_run` です。`check_suite` ではありません — GitHub は
Actions 自身のスイートではそれで workflow を起動しないので、チェックの完了は
長らくこの workflow に届いていませんでした。`workflow_run` は名前で対象を指す
ので、**必須 context を出す workflow を増やしたらここにも足す**必要がありま
す。名前が実在するかは `pnpm run check:root:workflow-run-names` が見ます。

イベントは**合図としてしか使いません** — payload の中身は job に一切入らず、
毎回 API から全 PR を読み直します。schedule は、Actions 以外が書く status が
将来現れたときのための下限として残しています。

同じ issue と同じブランチを全 run が書き換えるため concurrency は1グループに
直列化しています。`cancel-in-progress` は使いません。GitHub は run が queue に入った時点で
「すでに queue にいた run」を落とすので、バースト時は実行中の1本＋最新の1本だ
け残り、間は捨てられます。これが欲しい debounce そのもので、しかも枯渇しませ
ん。

## English

`pnpm run pr-report` reads every open pull request and prints a report. It
writes nothing — no labels, no rebases, no merges, no comments — which is what
makes it safe to run on a schedule, with a read-only token or none.

It reports what the pull request list cannot show in one screen: the merge
order declared by the `Merge-After:` trailers drawn as a tree, the issues each
pull request closes, its labels, the verdict of the contexts the ruleset
requires (named, including the ones that have reported nothing at all), how
far the branch is ahead of and behind its base, and — the one section that is
not about the queue — what merged recently.

Auto-merge is reported only when it is news. The label is the request and
auto-merge is the mechanism, and the two can come apart: a pull request
labelled `merge-queued` with nothing armed to land it is the combination
`unblock-prs` passes over with "auto-merge is not enabled", and it reads
`no auto-merge` here. One that has never been queued says nothing either way.

```bash
pnpm run pr-report                      # for a terminal (the default)
pnpm run pr-report -- --format markdown # for a GitHub issue or Claude
pnpm run pr-report -- --format json     # for another tool
pnpm run pr-report -- --repo owner/name # a different repository
pnpm run pr-report -- --merged-days 3   # how far back "recently merged" goes
pnpm run pr-report -- --merged-limit 5  # and how many it lists
```

The merged section is bounded twice, by days (7) and by count (20). The cap is
about reading rather than about fitting — the report is written to a file,
which refuses nothing — and past twenty the section stops being a list and
starts being an archive.

`GITHUB_TOKEN` or `GH_TOKEN` is used when set. Without one the public API
allows 60 requests an hour — about twenty pull requests at roughly three
requests each, which one report a day fits inside — and the issue links are
the ones the bodies declare with a closing keyword rather than GitHub's own
list, which only GraphQL serves. The report says so at the bottom when it ran
that way.

Four rules decide the verdicts. `skipped` is a pass, because GitHub counts it
as one. `skip-ci` is its own verdict, `paused`, because while the label is on
the red a reader sees is the cancelled `opened` run rather than news — it is
still listed, as `stale red:`. `no-skip-ci-label` is a commit status, not a
check run, so both endpoints are read. And where one name has reported more
than once, the run in the check suite with the greatest id is the answer,
which is how GitHub resolves it — not the newest run, which would call a pull
request green that a stale red is holding.

The required contexts come from `repo-settings/rulesets/main.json` rather than
from the API, which wants an admin token. A context added there and not yet
applied with `pnpm run repo-settings:apply` is reported as missing on every
pull request, which is a fair thing for a report to say.

It reads one page of a hundred pull requests and fails rather than reporting a
part of them as the whole. Pull requests on a `Merge-After` cycle are named in
their own section instead of being drawn, since there is no position in a
merge order to draw them at.

The script only prints. `.github/workflows/pr-report.yml` is what puts the text
somewhere: it force-pushes two files to `data/pr-report` — `pr-report.json`,
which the **GitHub Pull Requests Manager** page
(<https://noshiro-pf.github.io/mono/pr-manager/>, `apps/pr-manager-app`) reads,
and `pr-report.md`, the same report as prose, which GitHub renders on the
branch. It repeats the same text in the run summary.

This wrote to an issue until recently. `apps/pr-report-payload/README.md` says
why a branch; the short version is that an issue is a thing people open and
subscribe to rather than a database, and that the one property worth keeping —
a current report at a URL, readable without the app — is what `pr-report.md`
carries over. What it costs the publishing job is `issues: write` and every
call to `gh`.

**One run produces both.** The workflow passes `--payload-file` beside
`--format markdown`, because a second run would cost another twenty requests
and another minute, and would leave the issue and the page describing moments
that differ by whatever happened in between.

The workflow is two jobs. `report` runs the dependency tree and holds no
token, handing what it made over as an artifact; `publish` holds the token and
neither checks out nor installs anything, using only inline `git` and `gh`.
The same split as `pnpm-update.yml`, for the same reason.

It runs whenever something that can change the report happens — a
pull request opened, closed, reopened, edited, labelled, pushed to or switched
in or out of draft, a push to `main`, which moves the ahead / behind of every
open pull request at once, and the completion of each of the seven workflows
behind the required contexts — plus the daily schedule and
`workflow_dispatch`.

That last one is `workflow_run`, not `check_suite`: GitHub does not trigger a
workflow with `check_suite` when the suite is Actions' own, which is why a
check finishing went unheard here for so long. `workflow_run` matches on
another workflow's `name:`, so **a workflow added behind a required context
has to be added to that list too**, and
`pnpm run check:root:workflow-run-names` is what checks that every name there
resolves to a workflow that exists.

The events are pings and nothing else: no payload reaches the job, which
re-reads every pull request from the API each time. The schedule stays as the
floor, for anything that reports a status without an Actions workflow behind
it.

Every run edits the same body, so they share one concurrency group and run one
at a time, deliberately not with `cancel-in-progress`: GitHub already drops a
run that was queued when another is queued behind the same running one, which
debounces a burst down to one running plus the newest pending without the risk
that a trickle of events keeps cancelling the run that was about to write.
