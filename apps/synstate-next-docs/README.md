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
