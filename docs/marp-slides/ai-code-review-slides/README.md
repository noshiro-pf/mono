<!-- cspell:ignore Marp -->

# ai-code-review-slides

Marp slides (and the outline they were written from) for the talk
「AI の書いたコードのレビューがしんどい — 実装とレビューの『非対称性』を設計する」,
prepared for an internal LLM study group.

- `slides.md` — the Marp deck.
- `overview.md` — the outline / source material the deck was built from. Its
  appendix B records the changes made to the author's original memo and the
  claims that still need checking before the talk.

## Rendering

The deck carries no Marp dependency of its own; render it with the Marp CLI run
ad hoc, the same way `llm-eslint-harness-slides` is rendered:

```bash
npx @marp-team/marp-cli experimental/ai-code-review-slides/slides.md          # → slides.html
npx @marp-team/marp-cli experimental/ai-code-review-slides/slides.md --pdf    # → slides.pdf
```

## Why it lives under `experimental/`

`experimental/` is outside the pnpm workspace globs and is excluded from ESLint,
tsc, knip, Prettier, cspell and markdownlint, and a branch touching nothing else
skips the work in every check workflow. That is what a deck of Japanese prose
wants: cspell would only produce noise, and a Prettier version bump must not
rewrite a deck that has already been presented. The sibling deck
`experimental/llm-eslint-harness-slides/` is here for the same reason.

Unlike that one, this directory carries no `package.json`, lockfile or tooling
config — those were a leftover copy in the imported repository and are inert
here anyway.

## Relation to `llm-eslint-harness-slides`

The sibling deck argues that team conventions should be burned into lint rules
rather than restated in prompts. This one sits one level above it: which tasks
to hand to an AI at all, judged by how cheap the review is relative to the
implementation. The lint-rule story appears here as one case (a small blast
radius), and the deck links back to it rather than repeating it.

## Provenance

Written for this repository in 2026-08; not imported from anywhere. The
structure follows `llm-eslint-harness-slides` (`overview.md` outline +
`slides.md` deck, same Marp `style:` block) so the two decks look like one
series.

No employer-internal repository names, URLs or figures appear in either file —
the worked examples use the public ASAM OpenSCENARIO schema and generic
OpenAPI/swagger terminology only.
