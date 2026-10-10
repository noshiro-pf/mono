---
'eslint-plugin-ts-fortress': minor
---

Turn on `no-type-only-codec` in `recommended` at `error`, and read a package's
entry points from its `package.json` instead of requiring them as an option.

The entry points are what `exports` publishes — every subpath and condition —
and the legacy `main`, `module`, `types` and `typings` fields, traced back to
the source files they are built from: `./dist/index.mjs` becomes
`src/index.mts`, using the TypeScript project's `outDir` and `rootDir` when set.
A subpath counts as traced when any of its conditions is, so a `types` file a
build writes on its own needs no source. When some subpath cannot be traced,
the package's exported codecs are left alone rather than reported as unused
public API; `entryPoints` still names them for such a layout, and replaces what
`package.json` says.

Without type information the rule no longer fails: it checks the codecs that
are not exported, which need nothing but their own file, and leaves the
exported ones alone.
