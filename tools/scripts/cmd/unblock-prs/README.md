<!-- cspell:ignore unlabel, gpgsign -->

# `unblock-prs`

`pnpm run unblock-prs` — the mechanical half of the `/unblock-prs` skill.

- [日本語](#日本語)
- [English](#english)

The authority for the conventions this reads is `CLAUDE.md`: "Required status
checks", "Triggers, `skip-ci`, out-of-date branches" and "Commits and pull
requests". This file describes what the script does with them.

## 日本語

### 何をするスクリプトか

`merge-queued` ラベルの付いた PR を、PR 自身が宣言した順に **1本ずつ** 前に進
めます。1サイクルで触るのは常に1本だけです。マージした瞬間に `main` が動き、
他のブランチはすべて `BEHIND` に戻るため、まとめて rebase しても1本を除いて捨
てることになるからです。

**やらないこと**: マージ（auto-merge の仕事）、auto-merge を有効にすること、
`merge-queued` を付けること、レビュー承認、失敗したチェックの修正（skill の仕
事）。rebase は使い捨ての `git worktree` の中で行うので、実行元のチェックアウ
トの作業ツリーには触れません。

### PR 側で宣言する3つのこと

**`merge-queued` ラベル** が対象範囲そのものです。付いていない PR は何も言わず
に無視します。付いていて、かつ動かせない PR（auto-merge 無し / draft /
base が `main` でない）は理由をログに出します — ラベルは明示的な依頼なので、
答えが「できない」なら黙っていてはいけないからです。

**`Merge-After:` トレーラ** が順序を宣言します。行頭に書き、複数の番号を1行に
並べても、行を分けても構いません。

```markdown
Merge-After: #1901, #1903
```

- 指定した PR が **すべて** open でなくなるまで、その PR は pick されません
  （AND です）。
- 制約するのは pick だけです。すでに up-to-date でマージ進行中の PR は従来通り
  watch します。auto-merge は何が書かれていようとマージするので、そこで見送る
  と「直後にマージされて無効になるブランチ」を rebase しに行くだけです。
- 1つの PR が複数の先行 PR を指定でき、複数の PR が同じ先行 PR を指定できるの
  で、宣言されるのは列ではなくグラフです。**閉路は検出して名指しで報告**し、
  そこに含まれる PR は放置します（スクリプトには解消できないため）。
- **コードフェンス内のトレーラは読みません。** 宣言とその実例は同じ文字列なの
  で、この機能を説明する文書が本物の制約になってしまわないようにするためです。

**`blocks-release` ラベル** は「次のリリースにはこれが入っていなければならな
い」という宣言です。これが付いた PR が1本でも open な間、version PR
（ `changeset-release/main` から changesets が開く PR ）は pick されません。

- 制約するのは version PR だけです。ラベルの付いた PR 自身は何も制約されませ
  ん。
- **draft でも数えます。** キューに入れていない PR、まだ書きかけの PR でリリー
  スを止められるのがこのラベルの目的だからです。裏返すと、忘れられた draft が
  1本あるとリリースは止まり続けるので、毎サイクル名指しで報告します。
- 外す運用はありません。制約は「 open であること」なので、マージでもクローズで
  も PR が閉じれば自動的に解除されます。
- version PR 自身に付いた場合は無視します（自分で自分を止め続けるだけで、誰も
  外せないため）。

**なぜ本文ではなくラベルなのか。** version PR は唯一、本文に何も書けない PR で
す。`changesets/action` は main への push のたびに `updatePullRequest` で title
と body を丸ごと上書きするので、そこに書いた `Merge-After:` は消えます。しかも
消えるのは「キューに他の PR があって先にマージされた時」、つまり順序宣言が効い
ていてほしいまさにその瞬間です。だから宣言は逆側 — リリースが待っている当の
PR — から行います。public repository なので、コメントではなく write 権限の要る
ラベルであることにも意味があります。

**`skip-ci` は対象範囲の判定には使いません。** キューに入った PR を一時停止さ
せるだけで、順番が来たら外すのがこのスクリプトの仕事です。

### 起動時

`gh auth status` とデフォルトブランチの取得。SIGINT / SIGTERM のハンドラを設置
します（停止要求後は現在のステップを終えてから抜けます。2回目のシグナルは即
終了）。

### 1サイクル

#### 1. survey

`gh pr list` で open な PR を全件取得します（`body` を含む — 順序をそこから読
むため）。`mergeStateStatus` が `UNKNOWN` の PR があれば10秒おきに最大6回引き
直します。GitHub が計算中の状態を「up-to-date」と誤読しないためです。あわせて
`origin/main` の SHA と、ruleset が要求する status check の一覧を取得します。

#### 2. triage

1. 全 PR の body から `Merge-After:` を読んで依存グラフを作り、閉路を検出
   （ version PR の body だけは読みません — 上書きされるので）。
2. **範囲判定** — `merge-queued` が無ければ `ignore`（無言）。あって動かせなけ
   れば `note`（理由を出力）。
3. **skip 記録** — 前のサイクルで諦めた PR は、当時の head と base のままなら
   `note`。
4. **`Merge-After` ゲート** — 指定先が1つでも open なら `note`。
5. **version PR** — `changeset-release/<デフォルトブランチ>` から来た PR は専
   用の扱いになります。`blocks-release` の付いた open な PR があれば `note`。
   無ければ、そのブランチが **main の現在の先端の上に建っているか** を
   `git merge-base` で確かめ、建っていなければ `note`（ Release workflow がま
   だ作り直していない）。どちらでもなければ、`skip-ci` が付いていれば
   **candidate**、付いていなければ必須チェックを読んで **failing** か
   **in-flight**。`mergeStateStatus` を使わないのは、これを読み違えた代償が
   「feature 抜きのリリース」だからです（ GitHub の答えは非同期に計算された
   キャッシュ）。
6. **振り分け**
    - `skip-ci` 付き → **candidate**。merge state は見ません。
      `no-skip-ci-label` が pending なので、どれだけ準備できていても必ず
      `BLOCKED` になり、「スキップされたチェック」と「実行中のチェック」が区別
      できないからです。
    - `BEHIND` / `DIRTY` → **candidate**。`DIRTY` は GitHub が非同期に計算して
      キャッシュした答えで、しかも聞いている質問が違います（3-way merge が衝突
      するか／rebase が衝突するか）。除外理由にはせず、実際に rebase させて答
      えさせます。ただし確実な `BEHIND` より後ろに並べます。
    - `CLEAN` / `UNSTABLE` / `HAS_HOOKS` → **in-flight**。
    - `BLOCKED` → 必須チェックを読み、失敗なら **failing**、未完なら
      **in-flight**。

このスクリプトは **version PR を rebase しません。** `changeset-release/main`
は Release workflow が main の先端から毎回作り直して force-push するブランチで、
ここで rebase すると (a) 2つの自動化が同じブランチを force-push し、(b) 古い
version commit が「まだ消費していない changeset を含む先端」の上に乗るため、
マージすると **その changeset 抜きのリリース** が出ます。やることは `skip-ci`
を外すことだけです。候補の並びでも最後に回します — こちらはゲートではなく順序
なので、リリースを止めることはありません（キュー済みの変更とリリースが同時に準
備できた時、変更を先に入れるだけ）。

#### 3. 1本だけ動かす

**in-flight があればそれを watch して終わり** — rebase はしません。

なければ candidate の先頭（番号順、`DIRTY` は最後）に対して:

1. 使い捨て worktree で `origin/main` に rebase し、`--force-with-lease`
   （survey が見た head を明示）で push。
2. `skip-ci` が付いていれば、**push の後で** 再確認（まだ open か / head が今
   push したものか / 両ラベルがまだ付いているか）してからラベルを外します。
   順序が要点です。ラベルが付いている間の push は全チェックが skip される
   `synchronize` を起こすだけで無料ですが、ラベルを外すと `unlabeled` が発火
   し、**実際にマージされる head の上で** マトリクスが1回だけ走ります。逆順だ
   と rebase 前の head でフルマトリクスが起動し、直後の push がそれをキャンセ
   ルします。
3. rebase が no-op で、かつ `skip-ci` も付いていなかった場合だけ「GitHub の
   merge state が古かった」と判断し、30秒待って survey からやり直します。

失敗（conflict / push 拒否 / ラベル除去失敗）した場合は記録して **同じサイクル
内で次の候補へ** 進みます。キューが止まるわけではありません。

#### 4. watch

`--poll-interval`（既定60秒）待ってから、マージするか「しない」と確定するまで
ポーリングします。各回で次の順に判定し、該当した時点で抜けます。

| 条件                              | 結果                          |
| :-------------------------------- | :---------------------------- |
| `gh pr view` 失敗                 | 連続5回で `error`、未満は継続 |
| `MERGED`                          | `merged`                      |
| `OPEN` でない                     | `closed`                      |
| auto-merge が外れた               | `auto-merge-disabled`         |
| `skip-ci` が再付与された          | `skip-ci-labelled`            |
| head が push したものと違う       | `head-moved`                  |
| `BEHIND` / `DIRTY`                | `behind-again`                |
| 必須チェックが fail / cancel      | `checks-failed`               |
| 全 green が規定回数続く           | `not-merging`                 |
| `--watch-timeout`（既定90分）超過 | `timeout`                     |
| SIGINT / SIGTERM                  | `stopped`                     |

順序には意味があります。ラベルの再付与やブランチの移動をチェック結果より先に
見るのは、その状態の PR のチェックを読んでも意味がないからです。

**green の判定は「ruleset が要求する context 全部」** であり、報告済みのものだ
けではありません。head commit にまだ check run が無い必須 context は
`gh pr checks` の出力に pending として並ぶのではなく **行ごと現れません**。報
告済みだけで判定すると、25分かかるマトリクスの3分目に「完了」と誤読します。

全部 green なのにマージされない場合（未解決の会話、レビュー不足、マージ権限の
無い人が auto-merge を有効にした等）は rebase では直せないので、連続 green 回
数で打ち切ります。GitHub 自身が mergeable と言っている場合は3回、`BLOCKED` の
まま green の場合は8回。後者が長いのは、check run が superseded された直後の一
瞬がこの形になるためです。

#### 5. 記憶して次のサイクルへ

判定は **その head かつその base のまま** の間だけ有効です。

| 記録される理由                    | push で解除 | `main` の移動で解除 |
| :-------------------------------- | :---------: | :-----------------: |
| `rebase-failed`（実際に衝突した） |      ✓      |          ✓          |
| `push-failed`                     |      ✓      |          ✓          |
| `unlabel-failed`                  |      ✓      |          ✓          |
| `already-in-base`                 |      ✓      |          ✓          |
| `not-merging`                     |      ✓      |          ✓          |
| `watch-timeout`                   |      ✓      |          ✓          |
| `checks-failed`                   |      ✓      |   **✗（意図的）**   |

衝突の判定がキャッシュされないのはこのためです。衝突していた相手のコミットが
base の移動と一緒に消えたかもしれないので、`main` が動けば記録は捨てられ、次の
サイクルで再試行されます。`checks-failed` だけが base に紐付いていません —
rebase しても同じマトリクスが同じように落ちるだけで、直すのは人間の仕事だから
です。

このサイクルで触った PR が次の survey で open 一覧から消えていれば、マージされ
たのかクローズされたのかを報告します。watch を諦めた数分後にマージされた PR を
取りこぼさないためです。何もすることがなければ `--idle-interval`（既定300秒）
待って再 survey します。

### オプション

| オプション              | 既定 | 意味                                  |
| :---------------------- | ---: | :------------------------------------ |
| `--once`                |      | 1サイクルだけ実行して終了             |
| `--dry-run`             |      | survey と報告だけ行い、何も変更しない |
| `--idle-interval <sec>` |  300 | 何もない時の再 survey までの待ち時間  |
| `--poll-interval <sec>` |   60 | watch 中のポーリング間隔              |
| `--watch-timeout <min>` |   90 | 1本を諦めるまでの時間                 |
| `--no-log`              |      | 実行結果を issue に書かない           |

### 実行ログ

このスクリプトは手元で動き、何をしたかは標準出力にしか出ません。rebase が
conflict した、push が弾かれた、auto-merge の無い PR を見送った — どれも一度
きり、誰かの端末で起きて、そのあとはどこにも残りません。

そこで、**何かに手を出した実行だけ**が `data/unblock-prs-log` ブランチの
`unblock-prs-log.json` に記録を追記します（何もしなかった実行は書きません。夜
通し回した idle ループが「何もなし」で埋まるだけなので）。保持するのは直近 20
実行、1実行あたり 50 イベントまで。イベントは行ではなく構造 —「どの PR に」
「何をして」「どうなったか」— で、それを **GitHub Pull Requests Manager**
（<https://noshiro-pf.github.io/mono/pr-manager/>）が読んで表示します。

以前は issue でした。issue は人が読んで購読するものであって簡易DBではない、と
いうのが移した理由です（`apps/pr-report-payload/README.md`）。push は
`origin` が既に指している URL に対する素の `git` なので、普段ブランチを push
しているのと同じ資格情報で通ります。毎回 orphan commit を force-push するため、
ブランチは常に1コミット1ファイルのままです。署名はしません — 機械の出力です
し、`commit.gpgsign` を大域で有効にしている環境で鍵が無いときにログだけが落ち
るのは筋が悪いからです。

書き込みに失敗しても実行は止まりません。このスクリプトの仕事は PR を landing
させることで、ログが書けなかったことはそれを止める理由ではありません — ただし
黙って消えるのは最悪なので、その旨はログに出ます。

### ファイル構成

| ファイル          | 役割                                                      |
| :---------------- | :-------------------------------------------------------- |
| `main.mts`        | ループ本体とコマンドライン（入口）                        |
| `triage.mts`      | 1回の survey が各 PR について何を言うか                   |
| `merge-after.mts` | 宣言された順序 — トレーラのパーサと閉路検出               |
| `version-pr.mts`  | version PR と、それを止めているもの                       |
| `rebase.mts`      | ブランチを動かす — worktree 内の rebase と `skip-ci` 除去 |
| `watch.mts`       | 1本をマージまでポーリング                                 |
| `checks.mts`      | マージが何を待っているか                                  |
| `github.mts`      | `gh` / `git` を叩くもの全部。判断はしない                 |
| `labels.mts`      | 2つのラベルとその意味                                     |
| `skips.mts`       | 諦めた PR を何をもって覚え続けるか                        |
| `options.mts`     | コマンドライン                                            |
| `types.mts`       | 共有される型とスキーマ                                    |
| `constants.mts`   | 待ち時間と諦めるまでの回数                                |
| `run-log.mts`     | この実行が何をしたかと、それを書く issue                  |
| `util.mts`        | quoting、ログ、停止シグナル                               |

`index.mts` はありません。`ws:gen` は workspace メンバーしか歩かず `tools/` は
意図的にメンバーではないので、手で維持するだけの barrel になります。

## English

### What it does

Takes the pull requests labelled `merge-queued` forward **one at a time**, in
the order those pull requests declare. One per cycle, always: merging any of
them moves `main` and puts every other branch back to `BEHIND`, so a batch
rebase runs a full CI matrix per branch and throws all but the first away.

**What it never does**: merge (auto-merge's job), enable auto-merge, add
`merge-queued`, approve a review, or fix a failing check (the skill's job).
The rebase happens in a throwaway `git worktree`, so the checkout it runs from
is never touched.

### The three things a pull request declares

**The `merge-queued` label is the scope rule.** A pull request without it is
passed over in silence. One that has it and cannot be acted on — no
auto-merge, a draft, a base that is not `main` — is reported, because the
label asked for something and the answer is no.

**The `Merge-After:` trailer declares the order.** On its own line, naming as
many numbers as it likes, on one line or several:

```markdown
Merge-After: #1901, #1903
```

- The pull request is not picked until **every** pull request it names has
  left the open list. It is an AND, not an OR.
- It constrains picking and nothing else. One that is already up to date and
  merging is watched as ever, because auto-merge will merge it whatever is
  declared here — and passing it over would only send the cycle off to rebase
  a branch that merge is about to invalidate.
- One pull request may name several predecessors and several may name the
  same one, so what is declared is a graph rather than a list. **A cycle is
  detected and reported by name**, and everything caught in it is left alone,
  because nothing here can move it.
- **A trailer inside a fenced code block is not read**, so a document
  describing the convention does not become a constraint.

**The `blocks-release` label says the next release must contain this pull
request.** While one carrying it is open, the version pull request — the one
`changesets/action` opens from `changeset-release/main` — is not picked.

- It constrains the version pull request and nothing else. The pull request
  carrying it is not constrained at all.
- **A draft counts.** Holding a release for something not queued, or not
  finished, is the whole point of the label. The other side of that is a
  forgotten draft holding every release, so the blockers are named in the
  report on every cycle.
- Nothing ever takes it off: the constraint is "open", so merging or closing
  the pull request ends it and leaves no state to clean up.
- On the version pull request itself it is ignored — it would hold it forever
  with nothing able to take it off, which is a `Merge-After` cycle by another
  name.

**Why a label, and not the body.** The version pull request is the one pull
request that cannot declare anything in its body: `changesets/action`
overwrites its title and body through `updatePullRequest` on every push to the
base, so a `Merge-After:` written there is wiped — and wiped precisely when
another queued pull request merged first, which is when the order mattered. So
the declaration is made from the other side, by the pull request the release is
waiting for. A label rather than a comment for a second reason: this repository
is public, and a label needs write access while a comment does not.

**`skip-ci` is not a scope rule.** It pauses a queued pull request, and taking
it off when its turn comes is the job.

### At startup

`gh auth status` and the default branch. SIGINT / SIGTERM handlers are
installed: the first signal finishes the current step and stops, a second one
exits immediately.

### One cycle

#### 1. Survey

`gh pr list` for every open pull request, `body` included — that is where the
order is read from. While any of them reports `mergeStateStatus: UNKNOWN` the
list is fetched again, up to six times at ten-second intervals, so a state
GitHub is still computing is never read as up to date. The tip of
`origin/main` and the contexts the ruleset requires are read too.

#### 2. Triage

1. Build the dependency graph from every body's `Merge-After:`, and find the
   cycles in it. The version pull request's body is the one that is not read,
   because it is overwritten; others may still name it.
2. **Scope** — no `merge-queued` means `ignore`, silently. Queued but not
   actionable means a `note` naming the reason.
3. **Skip records** — a pull request a previous cycle gave up on is a `note`
   for as long as its head and the base are where they were.
4. **The `Merge-After` gate** — a `note` while anything it names is open.
5. **The version pull request** — one whose branch is
   `changeset-release/<default branch>` is handled on its own. A `note` while
   any pull request labelled `blocks-release` is open. Otherwise `git
merge-base` says whether the branch was built on the current tip of the
   base, and a `note` while it was not — the release workflow has not rebuilt
   it yet. Past both: **candidate** if it carries `skip-ci`, and otherwise
   **failing** or **in flight** by its required checks. `mergeStateStatus` is
   not what answers this one: GitHub's answer is computed asynchronously and
   cached, and being wrong here releases a set the branch was built before.
6. **The rest**
    - Carrying `skip-ci` → **candidate**, whatever the merge state says. With
      `no-skip-ci-label` pending it reads `BLOCKED` however ready it is, and
      checks that were skipped are indistinguishable from checks still
      running.
    - `BEHIND` / `DIRTY` → **candidate**. `DIRTY` is an asynchronously
      computed, cached answer to a different question — whether _merging_
      conflicts, not whether a rebase will — so it is never a reason to
      exclude. The rebase answers it; it is only ordered last.
    - `CLEAN` / `UNSTABLE` / `HAS_HOOKS` → **in flight**.
    - `BLOCKED` → read the required checks: **failing** if one failed,
      **in flight** if they are still running.

**The version pull request is never rebased.** `changeset-release/main` is
rebuilt from the tip of the base and force-pushed by the release workflow on
every push to it, so a rebase here would be (a) a second thing force-pushing
one branch and (b) the old version commit landing on a tip that carries a
changeset it never consumed — merge that and the release is missing the change
the queue was assembled for. Taking `skip-ci` off is the whole of what it is
given, and it is ordered last among the candidates. That last part is an
ordering and not a gate, so it never stops a release: it only means that when
a queued change and the release are both ready, the change goes in first.

#### 3. Act on exactly one

**If anything is in flight, watch that and stop** — do not rebase another.

Otherwise take the first candidate (lowest number, `DIRTY` last) and:

1. Rebase onto `origin/main` in a throwaway worktree and push with
   `--force-with-lease`, leased against the head the survey saw.
2. If it carries `skip-ci`, ask GitHub once more — still open, head is the
   commit just pushed, both labels still on — and then take the label off.
   The order is the point: while the label is on, the push fires a
   `synchronize` whose every check skips, so it is free; taking the label off
   then fires `unlabeled` and runs the matrix once, **on the head that will
   actually be merged**. The other order starts a full matrix on the
   pre-rebase head and has the push cancel it.
3. A rebase that changed nothing, on a pull request with no label to take off
   either, means GitHub's merge state was stale: wait thirty seconds and
   survey again.

A failure — a real conflict, a refused push, a label that could not be
removed — is recorded and **the next candidate is tried in the same cycle**.
The queue does not stop.

#### 4. Watch

After one `--poll-interval` (60s by default), poll until it merges or until
something says it will not. Each poll tests these in order and leaves on the
first that matches:

| Condition                     | Outcome                              |
| :---------------------------- | :----------------------------------- |
| `gh pr view` failed           | `error` after 5 in a row, else retry |
| `MERGED`                      | `merged`                             |
| not `OPEN`                    | `closed`                             |
| auto-merge switched off       | `auto-merge-disabled`                |
| `skip-ci` went back on        | `skip-ci-labelled`                   |
| head is not the commit pushed | `head-moved`                         |
| `BEHIND` / `DIRTY`            | `behind-again`                       |
| a required check failed       | `checks-failed`                      |
| green for the whole budget    | `not-merging`                        |
| past `--watch-timeout` (90m)  | `timeout`                            |
| SIGINT / SIGTERM              | `stopped`                            |

The order matters: a pull request whose label went back on, or whose branch
moved, is one whose check results say nothing.

**"Green" means the whole list the ruleset requires**, not the part of it that
has reported. A required context with no check run on the head commit is not
pending in `gh pr checks` — it is _absent_ from it, so judging by what has
reported writes a pull request off three minutes into a twenty-five minute
matrix.

A pull request that is green and still open is held by something a rebase
cannot fix — an unresolved conversation, a missing review, auto-merge armed by
someone who may not merge — so it is given a budget of consecutive green
polls: three when GitHub itself calls it mergeable, eight while it still reads
`BLOCKED`, because that combination is also what a check run that has just
been superseded looks like for a moment.

#### 5. Remember, and go round again

A verdict lasts as long as the state it was reached in.

| Recorded reason                   | Cleared by a push | Cleared when `main` moves |
| :-------------------------------- | :---------------: | :-----------------------: |
| `rebase-failed` (a real conflict) |         ✓         |             ✓             |
| `push-failed`                     |         ✓         |             ✓             |
| `unlabel-failed`                  |         ✓         |             ✓             |
| `already-in-base`                 |         ✓         |             ✓             |
| `not-merging`                     |         ✓         |             ✓             |
| `watch-timeout`                   |         ✓         |             ✓             |
| `checks-failed`                   |         ✓         |    **✗ (deliberate)**     |

So a conflict verdict is never cached across a base that moved: the commit it
conflicted with may have gone with it. `checks-failed` is the exception —
rebasing would put the same failing matrix through again, and fixing the
failure is a person's job, so the push that carries the fix is what clears it.

A pull request this run acted on that has left the open list by the next
survey is reported as merged or closed. Nothing else would notice one that
merged minutes after the watch gave up on it. With nothing to do, the loop
sleeps for `--idle-interval` (300s) and surveys again.

### Options

| Option                  | Default | Meaning                                    |
| :---------------------- | ------: | :----------------------------------------- |
| `--once`                |         | run one cycle and exit                     |
| `--dry-run`             |         | survey and report, change nothing          |
| `--idle-interval <sec>` |     300 | wait between surveys when there is nothing |
| `--poll-interval <sec>` |      60 | wait between polls of the watched one      |
| `--watch-timeout <min>` |      90 | give up on one pull request after this     |
| `--no-log`              |         | do not write the run to its issue          |

### The run log

This script runs on someone's machine and says everything it does on standard
output, which is exactly where nobody can see it afterwards. A rebase that
conflicted, a push that was refused, a queued pull request passed over for
having no auto-merge — each happened once, on a terminal, and was never
visible again.

So a run that **acts on something** adds a record to `unblock-prs-log.json` on
the `data/unblock-prs-log` branch. A run that acts on nothing writes nothing,
or an idle overnight loop would fill the log with entries saying so. Twenty
runs are kept, fifty events each. The entries are events rather than lines —
which pull request, what was done, how it turned out — which is also what the
**GitHub Pull Requests Manager** page
(<https://noshiro-pf.github.io/mono/pr-manager/>) lays out as rows.

It was an issue until recently; `apps/pr-report-payload/README.md` says why a
branch. The push is plain `git` against whatever URL `origin` already
resolves to, so it works with the credentials you push branches with, SSH or
HTTPS. Each run force-pushes a fresh orphan commit, so the branch stays one
commit holding one file. It signs nothing: this is machine output, and a
`commit.gpgsign` set globally would otherwise make the log — and only the log
— fail on a machine with no key loaded.

A log that could not be written never fails the run: the job is to land pull
requests, and this is not a reason to stop doing it. It is a reason to say so,
which it does, because an entry that silently went missing is worse than none.

### Layout

| File              | Role                                                     |
| :---------------- | :------------------------------------------------------- |
| `main.mts`        | the loop and the command line (entry point)              |
| `triage.mts`      | what one survey says about each pull request, and why    |
| `merge-after.mts` | the declared order — the trailer parser, cycle detection |
| `version-pr.mts`  | the version pull request, and what holds it back         |
| `rebase.mts`      | moving a branch — the worktree rebase, the label removal |
| `watch.mts`       | polling one pull request until it merges, or will not    |
| `checks.mts`      | what the merge is waiting for                            |
| `github.mts`      | everything that shells out to `gh` or `git`              |
| `labels.mts`      | the two labels, and what each one means                  |
| `skips.mts`       | what the loop remembers, and for how long                |
| `options.mts`     | the command line                                         |
| `types.mts`       | the shapes every module passes around                    |
| `constants.mts`   | how long it waits, and how long before it gives up       |
| `run-log.mts`     | what this run did, and the issue it is written to        |
| `util.mts`        | quoting, logging, the stop signal                        |

There is no `index.mts`: `ws:gen` only walks workspace members and `tools/` is
deliberately not one, so a barrel here would be hand-maintained for nothing.
