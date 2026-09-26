<!-- cspell:ignore unlabel, gpgsign, tmpfs -->

# `unblock-prs`

`pnpm run unblock-prs` — the mechanical half of the `/unblock-prs` skill.

- [日本語](#日本語)
- [English](#english)

The authority for the conventions this reads is `CLAUDE.md`: "CI" and
"Commits and pull requests". This file describes what the script does with
them.

## 日本語

### 何をするスクリプトか

`merge-queued` ラベルの付いた PR を、PR 自身が宣言した順に **1本ずつ** 前に進
めます。1サイクルで触るのは常に1本だけです。マージした瞬間に `main` が動き、
他のブランチはすべて `BEHIND` に戻るため、まとめて rebase しても1本を除いて捨
てることになるからです。

**やらないこと**: マージ（auto-merge の仕事）、auto-merge を有効にすること、
`merge-queued` を付けること、レビュー承認、失敗したチェックの修正（skill の仕
事。例外は fixer の差分だけで落ちた場合で、「4a」を参照）。rebase は使い捨ての
`git worktree` の中で行うので、実行元のチェックアウトの作業ツリーには触れませ
ん。

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

### 解放されている PR は1本まで

`merge-queued` が付いていて `skip-ci` の無い PR を「解放されている」と呼びます。
push されてもラベルが外れても、フルマトリクスが走る PR です。**解放されている
PR は常に1本まで** に保ちます。`main` が動く前にマージできるのは1本だけなの
で、2本目の実行は捨てることになるからです。

#### なぜ必要か — 起きていたこと

このスクリプトと `/unblock-prs` skill は、同じキューを互いに見えないまま並行し
て動かします。ルールが無いと、例えば次のことが起きます。

1. `merge-queued` の PR A の `skip-ci` を外し、CI を走らせる。CI が失敗してマー
   ジが止まる。A は `skip-ci` が外れたまま見送られる。
2. このスクリプトが次の `merge-queued` PR B を pick し、`skip-ci` を外す。
3. skill が A の失敗を直して push する。A の `skip-ci` は外れたままなので、この
   push で A のマトリクスも走る。
4. A と B で CI が同時に走り、先にマージされた方が `main` を動かす。もう片方は
   `BEHIND` に戻り、その CI 実行は丸ごと無駄になる。

どちらの書き手も単独では正しく動いています。無駄は、「CI を走らせてよいのは1本
だけ」という状態がどこにも記録されていないことから生まれます。`skip-ci` をその
記録として使います。

#### ルール

- **解放する前に他を止める。** PR を解放する前、つまり `skip-ci` を外す前や、ラベ
  ルの無い PR を rebase して push する前に、他の open な `merge-queued` PR で
  `skip-ci` の無いもの全部に `skip-ci` を付けます。in flight の PR を watch す
  る前も同じです。見送った PR も、draft も、auto-merge の無いものも対象です。
  どれも push されれば CI が走るからです。`pnpm-update.yml` はラベル無しで PR
  を開くので、ここで止まります。上の例では手順 2 で A に `skip-ci` が付き、手
  順 3 の push はチェックを全部 skip します。A はキューに戻り、B の後で rebase
  されて解放されます。
- **解放した直後にもう一度見る。** skill が同じ瞬間に別の PR を解放していると、ど
  ちらも相手がまだ止まっているのを見てから解放したことになります。2本とも解放
  されていたら、pick の順（番号の小さい順、version PR は最後）で先の方だけを残
  し、残りに `skip-ci` を付けます。自分の PR が負けた場合は survey からやり直し
  ます。skill も同じ規則で決めるので、両者は同じ1本に落ち着きます。

この規則が保証するのは CI 時間だけで、マージの正しさは保証しません。それは
ruleset（最新の `main` の上で必須チェックが全部緑）が別に保証しています。一覧
を読んでからラベルを付けるまでの数秒の間に誰かが push すると、2本目の実行は起
こりえます。ただし直後の見直しで片方が止められます。

### 起動時

`gh auth status` とデフォルトブランチの取得。SIGINT / SIGTERM のハンドラを設置
します（停止要求後は現在のステップを終えてから抜けます。2回目のシグナルは即
終了）。

### 1サイクル

#### 1. survey

`gh pr list` で open な PR を全件取得します（`body` を含む — 順序をそこから読
むため）。`mergeStateStatus` が `UNKNOWN` の PR があれば10秒おきに最大6回引き
直します。GitHub が計算中の状態を「up-to-date」と誤読しないためです。あわせて
`origin/main` の SHA と、`main` に適用されている rule を取得します。rule から
読むのは、必須の status check の一覧と、レビューへの2つの要件（code owner の承
認、会話の解決）です。宣言ファイルではなく GitHub が実際に適用しているものを読
みます。

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
7. **レビュー待ち** — **candidate** になった PR と、`BLOCKED` のまま
   **in-flight** になった PR について、レビューがマージを止めていないかを
   GraphQL 1回でまとめて読みます。止めていれば **held**（理由を出力）にして、
   rebase も解放も watch もしません。読むのは ruleset が要求する2つです。
    - **code owner の承認** — 変更したパスのうち `.github/CODEOWNERS` に所有者
      がいるもの全部に、所有者の承認が要ります。GitHub の `reviewDecision` は
      branch protection の答えで、ruleset のこのリポジトリでは常に `null` なの
      で、`CODEOWNERS` と変更ファイルと承認から計算します。Pull Requests
      Manager と同じ `pr-report-core` の `codeOwnerReview` です。作者自身が所有
      者なら、作者は自分の PR を承認できないので、そう出力します。
    - **未解決の会話** — 1件でもあれば。

    チェックでは分からない理由でマージできない PR を解放すると、マトリクスを
    1回丸ごと使い、watch の間キューを止めます。しかも `main` が動くたびに
    `BEHIND` として先頭に戻ってくるので、他の PR がマージされるたびに同じこと
    を繰り返します。承認や会話の解決があれば次の survey で答えが変わるので、
    skip 記録は作りません。変更ファイルが1ページ（100件）に収まらず判定しきれ
    ない場合と、読み取りに失敗した場合は、止めません（以前の動作）。GitHub が
    mergeable と言っている in-flight の PR は、それ自体が「チェック以外に残っ
    ているものは無い」という答えなので、今まで通り watch します。

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

なければ candidate の先頭に対して、次の手順を行います。並びは番号順で、後ろに回
すものが3種類あります。`DIRTY`、その後ろに version PR、さらにその後ろに green
のまま止まった PR（「5」）です。

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

例外は **作業中にブランチが動いた場合** です（rebase 前の fetch で head が
survey と違う / lease 負けで push が拒否され、remote の head が変わっている /
ラベルを外す前の再確認で head が違う）。これは skill や人が同じ PR を動かして
いるということなので、失敗として記録せず、次の候補にも進まずに survey からやり
直します。次の候補を rebase すると、相手が起動するマトリクスの横でもう1本走ら
せることになるからです。`/unblock-prs` skill はこのスクリプトと並行して動く前
提で書かれています。

#### 4. watch

`--poll-interval`（既定30秒）待ってから、マージするか「しない」と確定するまで
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

全部 green なのにマージされない場合は rebase では直せないので、連続 green 回
数で打ち切ります。原因のうち未解決の会話と code owner の承認不足は triage が先
に見つけて解放しないので（「2」の7）、ここに来るのはそれ以外です。たとえばマー
ジ権限の無い人が auto-merge を有効にした、このスクリプトが読まない rule に引っ
かかっている、などです。GitHub 自身が mergeable と言っている場合は3回、`BLOCKED` の
まま green の場合は8回。後者が長いのは、check run が superseded された直後の一
瞬がこの形になるためです。

#### 4a. fixer の差分だけで落ちたなら直す

watch が `checks-failed` で終わったら、その head の check run を集約 job の下の
matrix の job まで読みます。失敗した job が **すべて** `code-check (X)` か
`style-check (X)` で、`X` が `fix:` か `gen:` のコマンド（`ws:` /
`strict-lib:` 付きも含む）なら、それはコマンドがファイルを書き換えただけの失敗
です。どの job も最後に `z:assert-repo-is-clean` を実行するからです。その場合
に限り、次のことをします。

1. 使い捨ての worktree で `pnpm install --frozen-lockfile` し、CI がビルドする
   entry（`code-check` のすべてと `ws:gen`）があれば `ws:build` を実行します。
   worktree は `~/.local/state/unblock-prs/` に作ります。OS の temp は tmpfs
   のことが多く、pnpm store から `node_modules` をハードリンクできません。git
   ディレクトリや `~/.cache` の下も使えません。`fix:fmt:diff` は絶対パスのどこ
   かに `.git` / `.cache` / `dist` / `build` / `out` を含むファイルをすべて飛ば
   すためです。
2. 失敗したコマンドを、生成系 → その他 → フォーマッタの順に実行し、最後に
   `fix:fmt:diff` を実行します。
3. 差分があれば PR の1コミットに `--amend` し、失敗した head を lease にして
   `--force-with-lease` で push します。push は解放と同じ扱いなので、その前に
   他の PR を止めます。
4. 新しい head を watch します。**次の PR は pick しません。**

次の場合は何もせず、理由をログに出して従来通り `checks-failed` として見送り
ます。

- 失敗した job に1つでも fixer 以外がある（型、テスト、`ws:doc`、
  `Validate commit count` など）。push しても落ちるマトリクスを1回走らせるだけ
  なので、全体を skill に任せます。
- ブランチが1コミットでない。squash はメッセージを書く行為なので skill の仕事
  です。
- コマンドが失敗した、または差分が出なかった。
- 自動修正で push した head がまた落ちた。1回の watch につき1回までです。

対象は watch している1本、つまりこのサイクルが pick した PR だけです。
`merge-queued` で CI が落ちている他の PR には触れません。

- **`ws:doc` は対象外です。** `doc` が書くのは untracked な出力で、tree を汚す
  のはその中で呼ばれる生成器（`ws:gen` でも走る）です。しかも実行に10分かか
  ります。
- **oxfmt。** `fix:fmt:diff` は Prettier だけで、`strict-lib/` は整形しませ
  ん。fixer のうち `strict-lib/` に書くのは `strict-lib:fix:fmt` 自身だけなの
  で、それが落ちていればそのコマンドが実行されます。

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

`not-merging` の PR は、記録が消えた後も **candidate の最後**（version PR より
後ろ）に回されます。`main` が動けば記録は消えて `BEHIND` の candidate に戻り
ます。しかし原因は triage が読めなかったものなので、次もマージされない見込みが
高いです。先頭に置いたままだと、他の PR がマージされるたびにこの PR がマトリク
スを1回使い、green になって打ち切られる、という流れを繰り返します。除外ではな
く最後に回すだけなのは、推測が外れることがあるからです（原因がその後に解消して
いる場合）。この降格は **誰かが push するまで** 続きます。このスクリプト自身の
rebase や「4a」の push では解けません。記憶はプロセスの中だけにあるので、再起
動すると忘れます。

このサイクルで触った PR が次の survey で open 一覧から消えていれば、マージされ
たのかクローズされたのかを報告します。watch を諦めた数分後にマージされた PR を
取りこぼさないためです。

何もすることがなければ待ってから再 survey します。待ち時間は一覧が動いている
かどうかで変わります。open な PR の一覧（head、merge state、ラベル、
auto-merge、draft、本文）、レビュー待ちの理由、`main` の tip が
`--idle-after`（既定10回）続けて
前回の survey と同じになるまでは `--active-interval`（既定30秒）、それ以降は
`--idle-interval`（既定300秒）です。何か変われば短い間隔に戻ります。今キュー
に入れた PR を数分放置しないためです。

### オプション

| オプション                | 既定 | 意味                                         |
| :------------------------ | ---: | :------------------------------------------- |
| `--once`                  |      | 1サイクルだけ実行して終了                    |
| `--dry-run`               |      | survey と報告だけ行い、何も変更しない        |
| `--active-interval <sec>` |   30 | 一覧が動いている間の再 survey までの待ち時間 |
| `--idle-after <n>`        |   10 | 何回続けて変化が無ければ長い間隔にするか     |
| `--idle-interval <sec>`   |  300 | 一覧が止まった後の再 survey までの待ち時間   |
| `--poll-interval <sec>`   |   30 | watch 中のポーリング間隔                     |
| `--watch-timeout <min>`   |   90 | 1本を諦めるまでの時間                        |
| `--no-auto-fix`           |      | 「4a」の自動修正をしない                     |

### 見送った PR はどこで分かるか

このスクリプトは手元で動き、何をしたかは標準出力にしか出ません。そこで PR を
見送るたびに、**その PR の head commit に commit status を書きます**（context
`unblock-prs`、state `failure`、description に理由と見送った時点の base の
SHA）。**GitHub Pull Requests Manager**（<https://noshiro-pf.github.io/mono/pr-manager/>）
がそれを読んで PR ごとに表示するので、端末を見に行かなくても止まっている理由が
分かります。

- **GitHub の `mergeable` ではなくこちら**を見るのは、あれが merge の可否で、
  このスクリプトがするのは rebase だからです（`DIRTY` を信用しない理由と同じ）。
- **消す必要はありません。** status は commit に付くので、push で head が変われば
  新しい head には付いていません。base が動いた場合はページが古い記録として
  灰色で表示します（`checks-failed` を除く — `skips.mts` と同じ規則を
  `pr-report-core` の `setAsideStillApplies` で共有しています）。
- 必須 context ではないのでマージは止めません。PR 上に ✗ が1つ付きます。
- 書けるのは新しく見送ったときだけで、同じ状態のまま見送り続けている間は
  書き直しません。`--dry-run` では書きません。書けなかったときはその旨を
  ログに出して続行します。

code owner の承認待ちで止まっている PR は、変更したパスと `.github/CODEOWNERS`
からページが自分で判定します。このスクリプトも同じ判定で、その PR を解放せずに
残します（「2」の7）。この場合 status は書きません。承認されれば次の survey で
動き出すからです。

### ファイル構成

| ファイル          | 役割                                                      |
| :---------------- | :-------------------------------------------------------- |
| `main.mts`        | ループ本体とコマンドライン（入口）                        |
| `triage.mts`      | 1回の survey が各 PR について何を言うか                   |
| `merge-after.mts` | 宣言された順序が pick に何を言うか                        |
| `version-pr.mts`  | version PR と、それを止めているもの                       |
| `rebase.mts`      | ブランチを動かす — worktree 内の rebase と `skip-ci` 除去 |
| `release.mts`     | 解放されている PR を1本に保つ                             |
| `review.mts`      | レビューがマージを止めているか                            |
| `watch.mts`       | 1本をマージまでポーリング                                 |
| `auto-fix.mts`    | fixer の差分だけの失敗を直して push                       |
| `quiet.mts`       | 何もない時にどれだけ待つか                                |
| `checks.mts`      | マージが何を待っているか                                  |
| `github.mts`      | `gh` / `git` を叩くもの全部。判断はしない                 |
| `labels.mts`      | 3つのラベルがその PR について何を言うか                   |
| `skips.mts`       | 諦めた PR を何をもって覚え続けるか                        |
| `demotions.mts`   | green のまま止まった PR をいつまで最後に回すか            |
| `options.mts`     | コマンドライン                                            |
| `types.mts`       | 共有される型とスキーマ                                    |
| `constants.mts`   | 待ち時間と諦めるまでの回数                                |
| `util.mts`        | quoting、ログ、停止シグナル                               |

トレーラのパーサと閉路検出、ラベルの文字列、`CODEOWNERS` の判定は、同じ宣言を
読む Pull Requests Manager と共有するため `apps/pr-report-core` にあります。

`index.mts` はありません。`ws:gen` は workspace メンバーしか歩かず `tools/` は
意図的にメンバーではないので、手で維持するだけの barrel になります。

## English

### What it does

Takes the pull requests labelled `merge-queued` forward **one at a time**, in
the order those pull requests declare. One per cycle, always: merging any of
them moves `main` and puts every other branch back to `BEHIND`, so a batch
rebase runs a full CI matrix per branch and throws all but the first away.

**What it never does**: merge (auto-merge's job), enable auto-merge, add
`merge-queued`, approve a review, or fix a failing check (the skill's job —
except a failure that is only a fixer's diff, see "4a"). The rebase happens in
a throwaway `git worktree`, so the checkout it runs from is never touched.

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

### One released pull request at a time

A pull request labelled `merge-queued` without `skip-ci` is **released**:
pushing to it, or taking the label off, runs the full matrix. **At most one is
released at any time.** Only one can merge before `main` moves, so a second
one's run is thrown away.

#### Why — what happened without it

This script and the `/unblock-prs` skill move the same queue side by side,
and neither can see the other. Without the rule:

1. Queued pull request A has its `skip-ci` taken off, and its matrix runs. A
   check fails and the merge is blocked. A is set aside with the label off.
2. This script picks the next queued pull request, B, and takes its `skip-ci`
   off.
3. The skill fixes A's failure and pushes. A has no label, so the push starts
   A's matrix too.
4. A and B run at once. Whichever merges first moves `main`, the other goes
   back to `BEHIND`, and the whole of its run is wasted.

Each writer was right on its own. The waste comes from "only one may run" being
written down nowhere, and `skip-ci` is where it is now written.

#### The rule

- **Pause the others before releasing one.** That means before taking
  `skip-ci` off, before rebasing and pushing a pull request that has no label,
  and before watching the one in flight. Every other open `merge-queued` pull
  request without `skip-ci` gets the label. Set-aside ones, drafts and ones
  without auto-merge are included, because each runs a matrix when pushed to.
  `pnpm-update.yml` opens its pull request without the label, and this is
  where it gets paused. In the example, A gets `skip-ci` at step 2, so the push
  at step 3 skips every check. A is back in the queue, to be rebased and
  released after B.
- **Look again straight after releasing.** If the skill released another pull
  request in the same moment, each writer saw the other still paused. When two
  are released, the one first in the pick order keeps its release (lowest
  number, the version pull request last) and the rest are paused. If the loser
  is this run's own, it surveys again. The skill decides by the same rule, so
  both settle on the same one.

The rule protects CI time, not correctness. The ruleset protects correctness
on its own: every required check green, on the current `main`. A push in the
seconds between reading the list and adding a label can still start a second
run, and the look afterwards pauses one of the two.

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
`origin/main` is read too, and so are the rules GitHub applies to `main`: the
contexts they require, and whether they require a code owner's approval and
every conversation resolved. These are the rules GitHub enforces, not the ones
declared under `repo-settings/`.

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
7. **Its review** — for every **candidate**, and every **in flight** that
   GitHub still calls `BLOCKED`, one GraphQL request reads whether its review
   holds the merge. If it does, the pull request is **held**, with the reason
   in the output, and is not rebased, released or watched. Two things are
   read, the two the ruleset asks for:
    - **A code owner's approval** of every changed path that
      `.github/CODEOWNERS` gives an owner. GitHub's `reviewDecision` answers
      for branch protection, not a ruleset, and is `null` for every pull
      request here. So this is worked out from `CODEOWNERS`, the changed files
      and the approvals, by `pr-report-core`'s `codeOwnerReview`, the same
      code the Pull Requests Manager uses. When the author owns the path it
      says so, since an author may not approve their own pull request.
    - **An unresolved conversation**, any at all.

    Releasing a pull request that cannot merge for a reason no check reports
    runs a whole matrix and holds the queue for the length of a watch. And
    since `main` moving puts it back at the front as `BEHIND`, it would do so
    again every time anything else merged. An approval or a resolved
    conversation changes the answer on the next survey, so nothing is
    recorded. A pull request whose changed files run past one page (100) is
    not held on a guess, and neither is anything when the request fails; that
    is how the script behaved before it asked. One in flight that GitHub calls
    mergeable is watched as ever: that state is GitHub's own answer that
    nothing but the checks is left.

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

Otherwise take the first candidate. Candidates go lowest number first, with
three kinds moved back: `DIRTY` after the rest, the version pull request after
that, and one that sat green without merging (step 5) last of all. Then:

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

The exception is **a branch that moved under it**: the head the fetch finds
is not the one the survey saw, a push lost its lease to a head that has
since changed, or the re-read before taking the label off finds a different
head. That is the skill or a person moving the same pull request, so nothing
is recorded, and the cycle surveys again rather than moving on — rebasing the
next candidate would start a second matrix beside the one the other writer is
about to start. The `/unblock-prs` skill is written to run alongside this
script.

#### 4. Watch

After one `--poll-interval` (30s by default), poll until it merges or until
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
cannot fix, so it is given a budget of consecutive green polls. An unresolved
conversation or a missing code-owner approval is caught by triage before
release (step 2, item 7), so what reaches this point is anything else, such as
auto-merge armed by someone who may not merge, or a rule this script does not
read. The budget is three when GitHub itself calls it mergeable, eight while it still reads
`BLOCKED`, because that combination is also what a check run that has just
been superseded looks like for a moment.

#### 4a. Fix a failure that is only a fixer's diff

When the watch ends in `checks-failed`, the head's check runs are read down to
the matrix jobs under the aggregates. If **every** job that failed is a
`code-check (X)` or `style-check (X)` entry whose `X` is a `fix:` or `gen:`
command (under `ws:` or `strict-lib:` too), the failure is the command having
rewritten files, because every job ends with `z:assert-repo-is-clean`. Then,
and only then:

1. In a throwaway worktree, `pnpm install --frozen-lockfile`, and `ws:build`
   when CI builds for one of the entries (every `code-check` entry, and
   `ws:gen`). The worktree goes in `~/.local/state/unblock-prs/`. Not the OS
   temp directory, which is often a tmpfs, and the pnpm store hard-links
   `node_modules` only within one filesystem. Not the git directory or
   `~/.cache` either, because `fix:fmt:diff` skips every file with a `.git`,
   `.cache`, `dist`, `build` or `out` segment anywhere in its absolute path.
2. Run the failed commands, generators first and formatters last, then
   `fix:fmt:diff`.
3. If anything changed, amend it onto the pull request's one commit and push
   with `--force-with-lease` against the head that failed. The push is a
   release, so the others are paused first.
4. Watch the new head. **The next pull request is not picked.**

Nothing is done, and the pull request is set aside as `checks-failed` as
before with the reason logged, when:

- Any failed job is not a fixer (types, tests, `ws:doc`, `Validate commit
count`, …). Pushing would run a matrix that fails anyway, so the whole of it
  is left to the skill.
- The branch is not one commit. Squashing writes a message, which is the
  skill's to do.
- A command failed, or none of them changed anything.
- The head the fix pushed failed again. It is once per watch.

It applies to the one pull request being watched, the one this cycle picked,
and never to the other queued pull requests whose checks are failing.

- **`ws:doc` is not a fixer.** What `doc` writes is untracked; what leaves the
  tree dirty is a generator it calls, which `ws:gen` runs too, and it takes ten
  minutes.
- **oxfmt.** `fix:fmt:diff` is Prettier only and leaves `strict-lib/` alone.
  Of the fixers only `strict-lib:fix:fmt` itself writes there, so when that
  entry failed it is the command that runs.

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

A `not-merging` pull request is also **picked last** from then on, after the
version pull request, and this outlives the record. `main` moving clears the
record and makes it a `BEHIND` candidate again. But what held it is something
triage could not read, so it will most likely not merge next time either. Left
at the front, it would run a matrix, sit green and be given up on each time
anything else merged. It is moved back rather than excluded, because the
guess is wrong for one whose cause has since cleared. The demotion lasts until
**someone else pushes**: this script's own rebase, or a "4a" push, carries it
along. It is kept in memory only, so a restart forgets it.

A pull request this run acted on that has left the open list by the next
survey is reported as merged or closed. Nothing else would notice one that
merged minutes after the watch gave up on it.

With nothing to do, the loop sleeps and surveys again, for how long depending
on whether the list is still moving. It sleeps `--active-interval` (30s) until
`--idle-after` (10) surveys in a row have seen the same open pull requests
(head, merge state, labels, auto-merge, draft flag, body), the same reasons a
review holds any of them, and the same tip of `main`, and `--idle-interval` (300s) from then on. Any change brings it back
to the short interval, so a pull request queued a moment ago is not left for
minutes.

### Options

| Option                    | Default | Meaning                                    |
| :------------------------ | ------: | :----------------------------------------- |
| `--once`                  |         | run one cycle and exit                     |
| `--dry-run`               |         | survey and report, change nothing          |
| `--active-interval <sec>` |      30 | wait between surveys while the list moves  |
| `--idle-after <n>`        |      10 | unchanged surveys before the long wait     |
| `--idle-interval <sec>`   |     300 | wait between surveys once it has sat still |
| `--poll-interval <sec>`   |      30 | wait between polls of the watched one      |
| `--watch-timeout <min>`   |      90 | give up on one pull request after this     |
| `--no-auto-fix`           |         | skip the fix in "4a"                       |

### Where a passed-over pull request shows

This script runs on someone's machine and says everything it does on standard
output. So each time it sets a pull request aside it also **writes a commit
status on that pull request's head**: context `unblock-prs`, state `failure`,
and a description with the reason and the base's SHA at the time. The
**GitHub Pull Requests Manager** page
(<https://noshiro-pf.github.io/mono/pr-manager/>) reads it and shows it on
the pull request, so finding out why one is not moving does not mean finding
the terminal the script ran in.

- **This rather than GitHub's `mergeable`**, because that answers whether a
  merge conflicts and this script rebases — the same reason it does not take
  `DIRTY` at its word.
- **Nothing ever takes it off.** A status belongs to one commit, so a push
  leaves the new head without it. A moved base the page shows as a grey,
  older record (except `checks-failed`), by the rule `skips.mts` uses too,
  shared as `setAsideStillApplies` in `pr-report-core`.
- It is not a required context, so it holds no merge; it adds one ✗ to the
  pull request.
- It is written when a pull request is newly set aside, not again on every
  survey that finds the same record standing; not at all under `--dry-run`;
  and a status that could not be written is logged and nothing more.

A pull request waiting for a code owner the page works out for itself, from
the paths it changes and `.github/CODEOWNERS`. This script works it out the
same way and leaves that pull request in the queue (step 2, item 7). It writes
no status for it, because an approval puts it back in the running on the next
survey.

### Layout

| File              | Role                                                     |
| :---------------- | :------------------------------------------------------- |
| `main.mts`        | the loop and the command line (entry point)              |
| `triage.mts`      | what one survey says about each pull request, and why    |
| `merge-after.mts` | what the declared order says about picking               |
| `version-pr.mts`  | the version pull request, and what holds it back         |
| `rebase.mts`      | moving a branch — the worktree rebase, the label removal |
| `release.mts`     | holding the queue to one released pull request           |
| `review.mts`      | whether a pull request's review holds its merge          |
| `watch.mts`       | polling one pull request until it merges, or will not    |
| `auto-fix.mts`    | fixing and pushing a failure that is only a fixer's diff |
| `quiet.mts`       | how long to sleep when there is nothing to do            |
| `checks.mts`      | what the merge is waiting for                            |
| `github.mts`      | everything that shells out to `gh` or `git`              |
| `labels.mts`      | what the three labels say about a pull request           |
| `skips.mts`       | what the loop remembers, and for how long                |
| `demotions.mts`   | how long one that sat green without merging goes last    |
| `options.mts`     | the command line                                         |
| `types.mts`       | the shapes every module passes around                    |
| `constants.mts`   | how long it waits, and how long before it gives up       |
| `util.mts`        | quoting, logging, the stop signal                        |

The trailer parser, the cycle detection, the label strings and the
`CODEOWNERS` rules are in `apps/pr-report-core`, shared with the Pull Requests
Manager page, which reads the same declarations.

There is no `index.mts`: `ws:gen` only walks workspace members and `tools/` is
deliberately not one, so a barrel here would be hand-maintained for nothing.
