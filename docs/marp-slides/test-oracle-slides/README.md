<!-- cspell:ignore Marp Csmith -->

# test-oracle-slides

Outline and source material for 「テストのオラクルをどこから調達するか」, split out
of the sibling `ai-code-review-slides/`.

- `overview.md` — the outline / source material.
- `slides.md` — not written yet. When it is, build it from the same Marp
  `style:` block as `ai-code-review-slides/slides.md` so the two look like one
  series.

## Why it was split out

`ai-code-review-slides` argues that the tasks worth handing to an AI are the
ones where verifying the result is much cheaper than producing it, and names
four sources of that asymmetry: a finite output, an independent verifier, a
small blast radius, and statistical coverage. The fourth turned out to be
unlike the other three.

- It is the only source with none of the author's own cases behind it — every
  example is borrowed (Chromium, OSS-Fuzz, Csmith).
- It is the only source with no AI in it. Fuzzing, property-based, differential
  and metamorphic testing all predate LLMs.
- It is where the talk's central pattern goes when it breaks (that deck's 5.1),
  not part of the pattern itself.
- It had grown to 119 lines against 76 for the core section, and length is what
  an audience reads as importance.

The parent deck keeps the four-source axis and the notion of an oracle, and
points here for the techniques.

## Rendering

`slides.md` does not exist yet, so there is nothing to render here today. Once it
does: the deck carries no Marp dependency of its own; render it with the Marp CLI
run ad hoc, the same way the sibling decks are rendered:

```bash
npx @marp-team/marp-cli docs/marp-slides/test-oracle-slides/slides.md          # → slides.html
npx @marp-team/marp-cli docs/marp-slides/test-oracle-slides/slides.md --pdf    # → slides.pdf
```

## Provenance

Written for this repository in 2026-09, by extracting what was section 8 of
`ai-code-review-slides/overview.md` before that document was restructured (it has
no section 8 now; see its appendix C). No employer-internal repository names, URLs
or figures appear here — the worked examples are public projects and generic
terminology only.
