<!-- cspell:ignore Marp -->

# llm-eslint-harness-slides

Marp slides (and the outline they were written from) for the talk
"LLM × ESLint — ハーネスエンジニアリングで AI 出力精度を底上げする".

- `slides.md` — the Marp deck.
- `overview.md` — the outline / source material the deck was built from.

## Provenance

Imported verbatim from the standalone repository
<https://github.com/noshiro-pf/llm-eslint-harness-slides> at commit
`64ac403f54bfab63ff59a9d267632f1d90719cc0` (2026-05-29), which is being
deleted now that the content lives here. Nothing but this README was added.

It lives under `experimental/` because it is not part of the pnpm workspace:
its `package.json`, lockfile and tooling config (`.prettierrc`,
`.cspell.config.yaml`, `.markdownlint-cli2.mjs`, `.editorconfig`) are the
standalone repository's own and are not wired into this repository's checks.
Note that its `package.json` is a leftover copy of `common-agent-config`'s —
the name and description do not describe this deck.

The deck carries no Marp dependency of its own — it was rendered with the
Marp CLI run ad hoc (`npx @marp-team/marp-cli slides.md`). Nothing in this
repository's `ws:*` commands touches this directory.
