# `pr-description`

`pr-description` — reads and writes a pull request or issue description
written twice, the original and its translation, and keeps the two saying the
same thing.

- [日本語](#日本語)
- [English](#english)

## 日本語

### 何をするスクリプトか

`.github/unblock-prs.json` の `translation.heading`（このリポジトリでは
`日本語`）があると、description は次の形で書くものになります。

1. 原文。ツールとセッションが読むのはここだけです（`Merge-After:` の行、
   `## Review` など）。
2. `## <heading>` の行と、その下に訳文。訳文の見出しは原文の見出しを1段下げた
   もので、同じ順に並べます。
3. 訳文の後の最初の `---` 行と、その後のトレーラ（closing keyword、
   `Start-After:`、`Claude-Session:` など）。

片方だけを書き換えると、原文と訳文の内容が食い違います。このコマンドは、
**読むときは訳文を省き、書くときは両方が対応していることを確かめます**。

```bash
pnpm run pr-description -- read 1901                        # 訳文を省いて表示
pnpm run pr-description -- pull 1901 --file ./d.md           # 編集用に保存
pnpm run pr-description -- push 1901 --file ./d.md           # 書き戻す
pnpm run pr-description -- check --file ./d.md               # 投稿前に確かめる
pnpm run pr-description -- similar --title 'fix: x' --keyword onUserDelete  # 重複を探す
pnpm run pr-description -- create --title 'fix: x' --file ./d.md --priority B  # issue を作る
```

### issue を作るとき

`create` は `--priority` を必須とし、その段（`S`・`A`・`B`・`C`・`D`・`hold`）の
`priority:<段>` ラベルを付けて作ります。段の意味と決め方は、このリポジトリの
[`docs/issue-priority.md`](https://github.com/noshiro-pf/mono/blob/main/docs/issue-priority.md)
にあります。`priority:` で始まるラベルを `--label` で渡すと拒否します（issue が
持つ段は 1 つだけ）。`close` は既にある issue への判定なので、作るときには
使えません。

**重複は作る前に止めます。** `create` は open な issue を読み、タイトルが近い
もの（`similar.mts` の `DUPLICATE_THRESHOLD` 以上）があれば一覧を出して拒否
します。読んで別の問題だと分かったものは `--not-duplicate <番号>` で 1 つずつ
示すと通ります。本文を書く前には `similar` で、タイトルの近いものと、
`--keyword` に渡した名前（関数名、ファイル名、ルール名）をそのまま書いている
ものを一覧できます。

### 書くときに確かめること

`push`・`create`・`check` と、`open-pr --body-file` は、次のどれかに当たる本文を
拒否します。

- `## <heading>` の行が無い、2つある、または原文か訳文が空。
- 訳文の見出しが、原文の見出しを1段下げたものと同じ順に並んでいない
  （原文が見出しの無い段落で始まるなら、訳文はそこに `### 概要` のような見出しを
  1つ足してもかまいません）。
- `#N` の参照が片方にしか無い（コード、表、`Merge-After:` などの宣言、
  closing keyword の中は数えません）。
- 訳文にコードブロック、表、画像がある。どれも原文に1度だけ置き、訳文はそれを
  参照します。
- 訳文に `Merge-After:`・`Start-After:` の行や closing keyword がある。ツールと
  GitHub は本文のどこにあっても読むので、食い違った写しも効いてしまいます。

`push` はさらに次を確かめます。

- `pull` してから GitHub 上で本文が変わっていない（`open-pr --merge-before` など
  が書いた分を上書きしないため）。変わっていれば `pull` し直します。
- 原文と訳文が両方変わったか、どちらも変わっていない（末尾の空白、空行の数、
  `Merge-After:` 行の変更は数えません）。誤字の修正のように意味を変えない
  片側だけの変更は `--wording-only` で通します。

`pull` は本文を `--file` のパスに、取得した時点の本文を `<file>.pulled` に保存
します。`push` は書き込んだ後 `<file>.pulled` を更新するので、続けて編集して
もう一度 `push` できます。

`translation.heading` が無いリポジトリでは、`read` は本文をそのまま表示し、
`push` と `create` は形を確かめずに書きます（`push` の、`pull` 後に変わって
いないかの確認は残ります）。

## English

When `.github/unblock-prs.json` names a `translation.heading` (`日本語` here),
a description is the original, which tools and sessions read; then a
`## <heading>` line and the translation, its headings the original's one level
down in the same order; then, from the first `---` line after it, the
trailers — closing keywords, `Start-After:`, `Claude-Session:`. Halves edited
one at a time drift apart, so **reading leaves the translation out, and every
write checks that the halves still mirror each other**.

```bash
pnpm run pr-description -- read 1901                        # translation left out
pnpm run pr-description -- pull 1901 --file ./d.md           # save it to edit
pnpm run pr-description -- push 1901 --file ./d.md           # write it back
pnpm run pr-description -- check --file ./d.md               # before posting
pnpm run pr-description -- similar --title 'fix: x' --keyword onUserDelete  # look for duplicates
pnpm run pr-description -- create --title 'fix: x' --file ./d.md --priority B  # file an issue
```

`create` needs `--priority`, one of `S`, `A`, `B`, `C`, `D` and `hold`, and
files the issue with that `priority:<tier>` label; what the tiers mean and how
one is chosen is this repository's
[`docs/issue-priority.md`](https://github.com/noshiro-pf/mono/blob/main/docs/issue-priority.md).
It refuses a `priority:` label given with `--label`, since an issue carries one
tier, and `close`, which is a verdict on an issue that exists.

**A duplicate is stopped before it is filed.** `create` reads the open issues
and refuses while one has a title close to the new one (`DUPLICATE_THRESHOLD` in
`similar.mts`), listing them; each one read and found to be another problem is
named with `--not-duplicate <number>`. Before writing the body, `similar` lists
the open issues with a close title and those that name a `--keyword` as written
— a function, a file, a rule.

`push`, `create`, `check` and `open-pr --body-file` refuse a body when:

- the `## <heading>` line is missing or there twice, or a half is empty;
- the translation's headings are not the original's one level down, in order
  (where the original opens with prose under no heading, the translation may
  give it one, such as `### 概要`);
- a `#N` appears in one half only, counting neither code, tables,
  declarations nor closing keywords;
- the translation holds code, a table or an image, which appear once, in the
  original, for the translation to refer to;
- the translation holds a `Merge-After:` or `Start-After:` line or a closing
  keyword: the tools and GitHub read those wherever they are, so a copy that
  drifted would be obeyed too.

`push` also refuses when the description changed on GitHub since the `pull`
(`open-pr --merge-before` writes into other pull requests' bodies), and when
one half changed and the other did not. Trailing spaces, runs of blank lines
and the `Merge-After:` line do not count as a change. `--wording-only` lets
one half change alone, for a typo or another change that changes no meaning.

`pull` saves the description to `--file` and what it was to
`<file>.pulled`; `push` refreshes `<file>.pulled` after writing, so a second
edit pushes without a second pull.

Without `translation.heading`, `read` prints the description whole, and
`push` and `create` write it as it is; `push` still refuses one that changed
on GitHub since the `pull`.
