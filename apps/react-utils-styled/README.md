# react-utils-styled

Layout components built with Emotion: an aspect-ratio box, a centering wrapper,
two "show this crop of the image" components, and a renderer that mounts a
detached `HTMLImageElement` into the tree.

Restored from `experimental/` — see
[docs/monorepo-consolidation.md](../../docs/monorepo-consolidation.md). It is
what `react-blueprintjs-utils` needs, and it needs `react-utils` and
`resize-observer-react-hooks`, so it comes after those. Never published to npm,
so it lands in `apps/` as a private package.

**This is where Emotion enters the repository.** `@emotion/styled` is a runtime
dependency of these components; nothing else here uses it.

## What changed on the way back

- `toNonZeroFiniteNumber` / `toPositiveFiniteNumber` are `as…` in
  `ts-data-forge`.
- `Rect` has no successor there; [`src/utils`](./src/utils) carries it.
- `DeepReadonly<{ … ReactNode }>` is `Readonly<{ … }>`: a deeply-readonly
  `ReactNode` is no longer a `ReactNode`.
- `innerHTML = ''` followed by `append` is one `replaceChildren(…)`, which
  empties the node without going through the HTML parser.
