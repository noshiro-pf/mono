# `check:prose:markdown-wrap`

Reports a Markdown paragraph a change touched that is not filled to the print
width: a line with room left for the first word of the line after it, or a line
past the width with a space it could break at. Prettier keeps Markdown line
breaks as written (`proseWrap: "preserve"`), so a paragraph edited after it was
wrapped keeps whatever breaks the edit left behind, and nothing else reports it.
`ts-restrictions/no-ragged-comment-wrap` does the same for comments.

```sh
pnpm run check:prose:markdown-wrap   # report
pnpm run fix:markdown-wrap           # refill what it would report
```

- `main.mts` reads the change and the print width, and reports or rewrites.
- `paragraphs.mts` splits a document into paragraphs and refills them. Its
  heuristics are the comment rule's; change the two together.

## What it reads

Only the paragraphs with a line the change added or changed, or removed a line
next to, in the documents `isRepositoryProse` names
(`tools/scripts/lib/repo-files.mts`: no `CHANGELOG.md`, records, verbatim texts,
Zenn content or `experimental/`).
Many wrapped documents have ragged paragraphs that predate the check, and a
change is asked to refill only what it edits.

The change is the working tree, untracked files included, against the commit
`resolveDiffBase` gives (`tools/scripts/lib/diff-base.mts`): `PROSE_DIFF_BASE`
in CI, which `style-check.yml` sets to the base of the pull request and fetches,
and otherwise the merge base of `HEAD` and `origin/main`. The print width is the
one the Prettier CLI resolves for the file, `.editorconfig` included, 80 here.

## What it leaves alone

- A run of one line. Many documents, the docs sites' pages among them, put each
  paragraph on one line, and the check does not ask them to wrap.
- A break that may be deliberate: after a sentence end (`.`, `?`, `!`, `:`), a
  hard line break, or a line of one word; before a line starting with a capital;
  between two lines that both end with a comma.
- A line with a URL, East Asian text or an emoji, an image, or no letter or
  digit, and a run with an odd number of backticks or unbalanced braces on a
  line, or a tab in its prefix.
- A document with `\r\n` line endings, since a refill writes `\n`.
- Fences, front matter, headings, tables, HTML blocks, indented code, link
  reference definitions, MDX imports and Starlight asides.

A code span and an MDX expression (`{/* bench:… */}`) count as one word, so a
refill never breaks one, and a refill never starts a line with a word that means
something there (`-`, `1.`, `#`, `>`, `|`, `<`, a fence).
