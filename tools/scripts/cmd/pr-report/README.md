# `pr-report`

`pnpm run pr-report` — the state of every open pull request, in one page.

- [日本語](#日本語)
- [English](#english)

The conventions this reads are `CLAUDE.md`'s: "CI" and the `Merge-After:`
trailer described in `tools/scripts/cmd/unblock-prs/README.md`. This file
describes what the script does with them.

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
pnpm run pr-report -- --format markdown # GitHub / Claude 向け
pnpm run pr-report -- --format json     # 他のツールに渡す（body 込みの全体）
pnpm run pr-report -- --repo owner/name # 別のリポジトリ
pnpm run pr-report -- --merged-days 3   # 「直近マージ」の遡る日数
pnpm run pr-report -- --merged-limit 5  # その最大件数
```

`--merged-days`（既定 7）と `--merged-limit`（既定 20）は日数と件数の両方から
掛かります。上限は「入らないから」ではなく「読めなくなるから」で、20件を超えた
あたりからこのセクションは一覧ではなく履歴になります。

### トークン

`GITHUB_TOKEN` か `GH_TOKEN` があれば使い、無ければ無認証で読みます。mono は
public なので無認証でも動き、1回のレポートは匿名の 60 requests/hour に収まりま
す（PR 1本あたり約3リクエスト = 20本程度まで）。

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

スクリプトは stdout に出すだけです。Claude の routine や `/unblock-prs` が同じ
コマンドを実行して結果を読みます。

**GitHub Pull Requests Manager**
（<https://noshiro-pf.github.io/mono/pr-manager/>, `apps/pr-manager-app`）はこの
スクリプトの出力を読みません。ページは GitHub の GraphQL API を毎回自分で読み、
判定（必須 context の verdict、`Merge-After:` の木、件数）はこのスクリプトと同じ
`apps/pr-report-core` で下します。REST と GraphQL の2つの読み方があるのは、
Claude Code セッションのプロキシが GraphQL を拒否するためで、このスクリプトは
そこでも動くよう REST のままです。

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
pnpm run pr-report -- --format markdown # for GitHub or Claude
pnpm run pr-report -- --format json     # for another tool
pnpm run pr-report -- --repo owner/name # a different repository
pnpm run pr-report -- --merged-days 3   # how far back "recently merged" goes
pnpm run pr-report -- --merged-limit 5  # and how many it lists
```

The merged section is bounded twice, by days (7) and by count (20). The cap is
about reading rather than about fitting: past twenty the section stops being
a list and starts being an archive.

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

The script only prints. A Claude routine and `/unblock-prs` run the same
command and read what it prints.

The **GitHub Pull Requests Manager** page
(<https://noshiro-pf.github.io/mono/pr-manager/>, `apps/pr-manager-app`) does
not read this output. It reads GitHub's GraphQL API itself on every read, and
reaches its verdicts, merge order and counts through the same
`apps/pr-report-core` this script uses. There are two ways of reading because
a Claude Code session's proxy refuses GraphQL, and this script stays on REST
so that it runs there too.
