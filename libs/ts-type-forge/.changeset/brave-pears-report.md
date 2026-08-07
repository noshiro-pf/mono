---
'eslint-plugin-ts-type-forge': minor
---

Two new rules, both enabled by `configs.recommended`:

- **`prefer-strict-or-relaxed-utility-type`** — reports the standard library's
  `Exclude`, `Extract`, `Omit` and `Pick`, whose second argument is
  unconstrained, and points at the ts-type-forge pair that makes the choice
  explicit: `StrictExclude` / `RelaxedExclude`, `StrictExtract` /
  `RelaxedExtract`, `StrictOmit` / `RelaxedOmit`, `StrictPick` / `RelaxedPick`.
- **`prefer-readonly-or-mutable-record`** — reports `Record`, whose mutability
  is unstated, and points at `ReadonlyRecord` / `MutableRecord`.

Both report **suggestions** rather than an autofix: `Strict*` can turn working
code into a compile error and `Record` maps onto two different types, so the
choice is the author's. Editors offer both replacements (each one adding the
`import { type … } from 'ts-type-forge'` it needs, unless
`importStyle: 'global'`); `--fix` changes nothing. Qualified names
(`Utils.Pick<…>`) and files that declare or import their own `Pick` / `Record`
are left alone.
