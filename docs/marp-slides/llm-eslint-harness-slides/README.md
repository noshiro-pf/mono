<!-- cspell:ignore Marp -->

# llm-eslint-harness-slides

Marp slides (and the outline they were written from) for the talk
"LLM × ESLint — ハーネスエンジニアリングで AI 出力精度を底上げする".

- `slides.md` — the Marp deck.
- `overview.md` — the outline / source material the deck was built from.

## Provenance

Imported from the standalone repository
<https://github.com/noshiro-pf/llm-eslint-harness-slides> at commit
`64ac403f54bfab63ff59a9d267632f1d90719cc0` (2026-05-29), which is being
deleted now that the content lives here. It was first imported under
`experimental/`, then moved to `docs/marp-slides/` and edited here; the
standalone repository's `package.json`, lockfile and tooling config were not
kept. As part of `docs/`, it is covered by the root Prettier, cspell and
markdownlint setup.

Published at <https://noshiro-pf.github.io/mono/slides/llm-eslint-harness/>:
`deploy-pages.yml` renders it with `pnpm run build:marp-slides`, and
`build-pages-site.mts` serves the resulting `slides.html` as the deck's page.
