<!-- cspell:ignore Marp -->

# ai-code-review-slides

Marp slides (and the outline they were written from) for the talk
「コードではなく、コードを生成するコードを書かせる — AI の書いたコードのレビューが
しんどい問題への、ひとつの答え」, prepared for an internal LLM study group.

- `slides.md` — the Marp deck.
- `overview.md` — the outline / source material the deck was built from. Its
  appendix B holds the material deliberately left out of the deck, and appendix
  C records the structural changes and the claims that still need checking
  before the talk.
- `bank.md` — an excerpt of the Nikkei xTECH article behind the external case
  in §2.4, kept verbatim as received.

## Structure

The deck is a success story followed by its analysis, in that order:

1. the problem — AI made implementation fast and left review as the bottleneck;
2. **what was done** — the transformation itself was not handed to an AI; the
   implementation of a transformation _tool_ was, and only its output was
   reviewed;
3. **why it worked** — five factors, of which the sharpest is that the error
   distribution changes from random to systematic;
4. the generalization — those factors, rearranged, are the four sources of
   asymmetry between implementation cost and review cost;
5. where the pattern breaks.

That order is deliberate and was not the original one. The four sources were
derived from the one experience, so the experience comes first; see appendix C.1
of `overview.md`.

## Rendering

The deck carries no Marp dependency of its own; render it with the Marp CLI run
ad hoc, the same way `llm-eslint-harness-slides` is rendered:

```bash
npx @marp-team/marp-cli docs/marp-slides/ai-code-review-slides/slides.md          # → slides.html
npx @marp-team/marp-cli docs/marp-slides/ai-code-review-slides/slides.md --pdf    # → slides.pdf
```

## Relation to the sibling decks

- `docs/marp-slides/test-oracle-slides/` — the fourth source (statistical
  coverage) in detail: where a test oracle can be obtained from, and what
  fuzzing, property-based, differential and metamorphic testing each cost. It
  was split out of this deck because it is the one source with none of the
  author's own cases behind it.
- `docs/marp-slides/llm-eslint-harness-slides/` — burning team conventions into
  lint rules rather than restating them in prompts. That story appears here as
  one case with a different factor behind it (§3.6, a small blast radius), and
  this deck links back to it rather than repeating it.

## Provenance

Written for this repository in 2026-08, restructured in 2026-09; not imported
from anywhere. The layout follows `llm-eslint-harness-slides` (`overview.md`
outline + `slides.md` deck, same Marp `style:` block) so the decks look like one
series.

No employer-internal repository names, URLs or figures appear in any of these
files — the worked examples use the public ASAM OpenSCENARIO schema, generic
OpenAPI/swagger terminology, and a published news article.
