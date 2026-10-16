# @synstate/docs

The documentation site for [synstate](../../libs/synstate), built with
[Astro Starlight](https://starlight.astro.build/).

Published at **<https://noshiro-pf.github.io/mono/synstate>** (English and
Japanese).

## Development

```sh
pnpm run dev      # start the dev server
pnpm run build    # regenerate embedded docs, then build the site into dist/
pnpm run preview  # serve the built site
```

Pages live in `src/content/docs/` (Japanese under `src/content/docs/ja/`). API
reference, examples and benchmark results are embedded by the `gen:*` scripts
in `scripts/`; run `pnpm run gen` after changing them.

## Links

- [Published site](https://noshiro-pf.github.io/mono/synstate)
- [synstate package](../../libs/synstate)
- <https://starlight.astro.build/ja/components/code/>
- [Source of the slide diagrams in the docs (Google slides, private)](https://docs.google.com/presentation/d/1_DQanZBI3vG9eQ3Lolw7ko8TZcaYgZnBzBnou20nXnE/edit?slide=id.g3c56a79e56b_0_7#slide=id.g3c56a79e56b_0_7)
