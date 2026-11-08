# synstate-next-docs

The documentation site for [synstate-next](../../libs/synstate-next), the
from-scratch rebuild of synstate, built with
[Astro Starlight](https://starlight.astro.build/), in English and Japanese.
Published at <https://noshiro-pf.github.io/mono/synstate-next/> by
`.github/workflows/deploy-pages.yml`.

## Development

```sh
pnpm run dev      # start the dev server
pnpm run build    # build the site into dist/
pnpm run gen      # re-embed the samples
```

Pages live in `src/content/docs/` (Japanese under `src/content/docs/ja/`).

**Code blocks are not edited here.** Each one is a file under
`libs/synstate-next/samples/docs-site/`, where synstate-next's own `tsc`,
ESLint and Vitest check it, embedded by `gen:samples`
(`scripts/embed-samples.mts` maps each page to its files, in order). Edit the
sample and run `pnpm run gen`; an edit made to a page is overwritten by the next
`gen`.

**The reference pages** (`src/content/docs/reference/`) are listed in
`scripts/reference-pages.mts`, one per public API, and `gen:reference` fails on
an export no page lists. It writes each English page's JSDoc block from
synstate-next's sources, and its description on a page of one export (a page of
several is described by hand). The Japanese text is translated by hand, and its
`{/* translated-from:<version> */}` marker names the version of the English text
it translates: when that changes, `gen:reference` names each Japanese page to
bring up to date and the version to set.
