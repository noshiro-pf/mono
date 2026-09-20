<!-- cspell:ignore unreviewed -->

# `open-pr`

`pnpm run open-pr` — opens the pull request for the current branch the way
this repository wants one opened, in the one order that is safe.

- [日本語](#日本語)
- [English](#english)

The conventions this follows are `CLAUDE.md`'s: "Commits and pull requests"
and "Triggers, `skip-ci`, out-of-date branches". This file describes what the
script does with them.

## 日本語

### 何をするスクリプトか

現在のブランチを push し、PR を **ready for review** で作り、**`skip-ci`** を
付け、**最後に auto-merge を張ります**。この4手順だけです。マージもしませんし、
`merge-queued` も付けません（それはレビュー後に人が行うことです）。

### なぜスクリプトなのか — 順序が安全性そのものだから

**`skip-ci` がマージを止めている唯一のものです。** `main` の ruleset は
`required_approving_review_count: 0` なので、`.github/CODEOWNERS` が挙げるパス
の外では、緑になった PR には他に何もクリアするものが残りません。

したがって **ラベルより先に auto-merge を張ると、「止めるものが無い状態で武装
している」瞬間が生まれます**。その窓が開いている長さは、次に何が走るか次第です。

散文で書けば順序は「覚えておくこと」ですが、ここでは「起きること」になります。
さらに `armBlockedBy` は **PR を読み直してから** 判断します。同じ実行の中で数行
上のラベル追加が成功を報告していても、それは「今ラベルが付いている」ことと同じ
ではないからです。この差が `main` に着地する唯一の判断がここです。

### 途中で失敗したら、もう一度実行してください

各ステップは既に済んでいればスキップされます。PR が既にあれば作らず、ラベルが
既にあれば付け直さず、auto-merge が既に張られていれば何もしません。巻き戻す必要
はありません。

### 実行

```bash
pnpm run open-pr                                   # 既定
pnpm run open-pr -- --dry-run                      # 何をするかだけ表示
pnpm run open-pr -- --title 'fix: 説明' --body-file ./pr.md
pnpm run open-pr -- --merge-after '#1901'          # チェーンを宣言
```

| オプション           |                既定 | 意味                                      |
| :------------------- | ------------------: | :---------------------------------------- |
| `--title <text>`     |  直前のコミット件名 | PR タイトル（英語、Conventional Commits） |
| `--body-file <path>` | トレーラのみ / 空欄 | 本文を読むファイル                        |
| `--base <branch>`    |  リポジトリの既定値 | 対象ブランチ                              |
| `--merge-after <n>`  |                なし | `Merge-After:` を宣言（複数回可）         |
| `--dry-run`          |                 off | 何も触らずに手順だけ出す                  |

**本文は自分で書くものです。** `skip-ci` が付いている間はローカルで走らせた
チェックがそのブランチの唯一のチェックなので、どれを走らせたかを本文に書いて
ください。`--merge-after` を付けると `Merge-After:` 行が本文の先頭に入ります。

### 拒否すること

- 既定ブランチの上にいるとき（先にブランチを切ってください）
- detached HEAD のとき
- `gh` が未認証のとき
- **読み直した PR に `skip-ci` が無いとき** — auto-merge を張らずに失敗します
- **PR が draft のとき** — GitHub が draft に auto-merge を張れないため、
  先に ready にします（既存 PR が draft だった場合）

### この後

レビューが終わったら **`merge-queued` を付けるだけ**です。auto-merge は既に
張られているので、`unblock-prs` が順番に rebase して `skip-ci` を外し、緑に
なった時点で GitHub がマージします。**`skip-ci` を手で外さないでください** —
それが未レビューのままマージさせる唯一の操作です。

## English

`pnpm run open-pr` pushes the current branch, creates the pull request ready
for review, adds `skip-ci`, and arms auto-merge — in that order. It merges
nothing and never adds `merge-queued`, which is a person's statement that the
pull request has been reviewed.

**The order is why this is a script rather than a paragraph.** `skip-ci` is
the only thing holding the merge: the `main` ruleset asks for
`required_approving_review_count: 0`, so outside the paths `.github/CODEOWNERS`
lists a green pull request has nothing else to clear. Arming before the label
is arming with nothing holding it, for however long whatever runs next takes.
And the arming step acts on a **fresh read** rather than on what the label call
a few lines earlier reported, because "the call succeeded" and "the label is on
now" are not the same claim, and this is the one decision where the difference
lands on `main`.

Every step is skipped when it is already done, so a run that failed part way
through is finished by running it again rather than unpicked.

```bash
pnpm run open-pr                                   # the default
pnpm run open-pr -- --dry-run                      # say what would be done
pnpm run open-pr -- --title 'fix: a thing' --body-file ./pr.md
pnpm run open-pr -- --merge-after '#1901'          # declare a chain
```

| option               |                default | meaning                                   |
| :------------------- | ---------------------: | :---------------------------------------- |
| `--title <text>`     |    last commit subject | the title, in English                     |
| `--body-file <path>` |  the trailer, or empty | where to read the body from               |
| `--base <branch>`    | the repository default | what to target                            |
| `--merge-after <n>`  |                   none | declare a predecessor; repeat for several |
| `--dry-run`          |                    off | print the steps and touch nothing         |

The description is yours to write: while `skip-ci` is on, the checks you ran
locally are the only checks the branch gets, so say which ones. `--merge-after`
puts the `Merge-After:` line at the top of the body, where `unblock-prs` reads
it.

It refuses to run on the default branch, on a detached HEAD, and without an
authenticated `gh`. It refuses to arm when the re-read says the pull request is
not open, is a draft, or does not carry `skip-ci` — the last of those being the
whole point.

Afterwards, queueing it is one action: add `merge-queued` once it has been
reviewed. `unblock-prs` takes `skip-ci` off when its turn comes, and GitHub
merges it. Taking `skip-ci` off by hand is the one action that merges
unreviewed work.
