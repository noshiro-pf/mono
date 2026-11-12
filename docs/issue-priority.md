# issue の優先度 — `priority:<段>`

open な issue はどれも、**優先度の段を表す `priority:<段>` ラベルをちょうど 1 つ**
持つ。段は issue を作るときに決める。決めるのは issue を書くセッション（Claude）で、
この文書がその基準になる。

- 作るときは `pnpm run pr-description -- create --priority <段>` を使う
  （`libs/pr-merge-queue/src/pr-description/README.md`）。`--priority` が無いと
  作らないので、段の無い issue はこの経路からは生まれない。手順は
  `file-issue` skill（`.claude/skills/file-issue/SKILL.md`）にまとめてある。
- GitHub の画面から作った issue など、段が無いものや 2 つ以上あるものは、
  `pnpm run pr-report` の issue の節に `no priority tier` /
  `several priority tiers` と出る。見つけたら段を付ける。
- `run-issue-resolver` は着手できる issue を段の順（`S`、`A`、`B`、`C`、段なし、
  `D`）に取り、`hold` と `close` は取らない。ただし `S` より下の issue は、主な
  テーマ（タイトルの scope と、それが属するパッケージ）がすでに着手された issue
  か、同時に始めるほかのセッションの issue と同じなら、空くまで待たせる（#3598）。
  `/resolve-issues` はテーマごとにまとめて取る（`startable-issues`）。

## 段

| 段      | 意味                                                                       | 例                                                                                                                                   |
| :------ | :------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `S`     | 開発効率に今すぐ効く                                                       | CI が全 PR で赤くなる、`check-changed` を通っても CI で落ちる、セッションを誤らせる文書の誤り                                        |
| `A`     | 開発効率の基盤、手作業の自動化、セキュリティ、実ユーザーの目的を止めるバグ | マージキューが止まる・状態を誤認する、テストが黙って CI から抜ける、拡張の審査送信やデプロイを手でしている、コマンドが一度も動かない |
| `B`     | 実利用アプリと公開パッケージのその他のバグ、中程度の効率改善               | 表示の誤り、型の誤り、性能、手で同期している一覧の導出                                                                               |
| `C`     | ドキュメント、リファクタ、小さな改善、軽い機能                             | コメントと実装の食い違い、重複コードの共通化、guard の取りこぼしの補修                                                               |
| `D`     | おもちゃアプリ、大きな機能追加                                             | 作者しか使わないアプリのバグ、バックエンドの移行、新しい画面                                                                         |
| `hold`  | 今の状況では着手しない                                                     | 置き換わる予定のコードのバグ、判断待ちの依存更新、Sumi のように段階を待つもの                                                        |
| `close` | 次の見直しで閉じるか、ほかの issue に統合する                              | 重複、済んでいるもの、範囲が曖昧なもの                                                                                               |

`close` は既にある issue への判定なので、作るときには使えない。

## 決め方

上から順に当てはめ、最初に当たった段にする。迷ったら高いほうにする。

1. **開発効率を上げるものを最も高くする。** CI の実行時間を縮めるもの、CI まで
   行って初めて分かる失敗を手元（`check-changed`）で捕まえるもの、マージキューや
   PR ツールの誤り、レビューループを長くするもの（レビューで毎回指摘される種類を
   check にする、セッションを誤った手順へ導く文書を直す）、**今は人が手でしている
   作業を自動化するもの**（リリースやストアへの審査送信、デプロイ、ワーカーの
   再起動）がこれに当たる。
    - 今まさに起きていて、直せばすぐ効くものは `S`。人が毎日のように手でして
      いる作業の自動化もここ。
    - 他の改善の前提になるもの、黙って検査が抜けるもの、まれだが起きると止まる
      もの、リリースのたびに人が手でしている作業の自動化は `A`。
    - 手で揃えている一覧を導出にするなど、人の作業は減らないが間違いを減らす
      ものは `B`。
2. **セキュリティは `A`。** ただし深刻なもの（認証・権限の回避、個人情報の
   漏洩、悪用の手順として読めるもの）は公開 issue にしない。`CLAUDE.md` の
   「Security findings」節のとおり `noshiro-pf/mono-security` に書く。ここに残すのは
   ハードニングのような軽微なもので、`B` か `C` にする。
3. **機能追加よりバグ修正を高くする。** ただしバグの段は、それを踏む人がいるかで
   決める。
    - 実ユーザーのいるアプリ（下の一覧）と公開パッケージのバグは `B`。利用者の
      目的そのものを止める（コマンドが動かない、データが壊れる・消える、メールが
      二重に届く）なら `A`。
    - おもちゃアプリのバグは `D`。
    - 置き換わる予定のコードのバグは `hold`。
4. **lint ルールの autofix がコードの意味を変える、またはコンパイルできない
   コードを書くとき**は、まずその fix を suggestion にとどめ（`--fix` で適用され
   なくする）、それから fixer として適用できる水準に直す。前者は開発効率の `A`、
   後者はルールの持ち主の段（公開パッケージなら `B`）で、別の issue にする。
5. それ以外の改善・リファクタ・文書は `C`、大きな機能は `D`。

## 実ユーザーのいるアプリ

バグの段を決めるために、作者が判断した一覧（2026-11-03）。ここに無いアプリで
迷ったら作者に聞き、答えをここに足す。

- **実ユーザーがいる**: `event-schedule-app`（`-functions`・`-shared` を含む）、
  `poll-discord-app`、`task-manager`、`life-plan-simulator`、
  `split-view-extension`、`profile`。開発ツールとして毎日使う `pr-manager`。
  `libs/` と `strict-lib/` の公開パッケージ。
- **おもちゃ**: `algo-app`、`housing-loan-calculator`、`mahjong-calculator-app`、
  `mahjong-scoring-tool`、`lambda-calculus-interpreter-*`、`color-demo`、
  `annotation-tool`、`synstate-dom-benchmark`、`cant-stop-probability`、
  `catan-dice`。
- **置き換わる予定（`hold`）**: synstate-dom への移行で消える React 向けの
  `apps/` 内ユーティリティ — `react-utils`、`preact-utils`、`react-utils-styled`、
  `react-blueprintjs-utils`、`numeric-input-utils`。`event-schedule-app` の
  移行（#2649）が済んだら、残っている issue を閉じるか見直す。

## `Start-After:` との関係

**段の高い issue が、段の低いものを待ってはいけない。** 待つ理由はあるはずなので、
次のどちらかにする（`docs/issue-start-after.md`）。

- 待たれている issue のうち、本当に必要な部分を切り出し、待つ側と同じかそれより
  高い段にして、その部分を名指す。
- 名指しが「よりよい順序」にすぎず、待たせるほどの理由が無いなら、宣言を外す。

## 付け替えと見直し

- 段は状況で変わる。付け替えるときは前のラベルを外し、新しいラベルを 1 つだけ
  付ける。
- `close` を付けたものは、次の見直しで閉じる。統合するときは、残す issue に欠けて
  いる内容を移し、もう一方を duplicate として閉じ、閉じた issue を名指していた
  `Start-After:` を残すほうへ付け替える（名指したものが duplicate として閉じると
  「要見直し」になる）。

## issue に `pending` は付けない

issue を止めるのは `priority:hold` だけにする。`pending` ラベルは pull request
の「作者が今は止めている」印で、マージ順（Pull Requests Manager）がそれを数える。
issue に付いていると、`pnpm run pr-report` が `pending is for pull requests` と
出すので、`priority:hold` に付け替える。作者が一時的に止めたい issue も `hold` に
し、それまでの段はコメントに残す。止めるのをやめるときは、この文書の決め方で段を
付け直す。

## pull request の `priority:high` / `priority:low`

これは別のもので、マージキューで pull request を先に／後に取る印
（`libs/pr-merge-queue/src/unblock-prs/README.md`）。issue には付けない。
`priority:mid` はどちらにも使わない。
