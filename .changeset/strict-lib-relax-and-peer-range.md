---
'strict-ts-lib-v5.0-source': minor
---

Leave `Exclude`, `Extract`, `Omit` and `Pick` with the constraints TypeScript
declares, and widen `strict-ts-lib-v7.0`'s `typescript` peer range to
`>=6.0.0 <8.0.0`.

Both landed on main in #1672 and #1673 but shipped no release: those changesets
named the bundle packages (`strict-ts-lib-v7.0` and friends) rather than the
`-source` harnesses this repository versions. `changeset version` bumped the
bundle manifests, and `strict-lib:gen:packages` — which runs next and stamps
each bundle with its harness's version — wrote 0.5.1 straight back over them,
the harnesses never having been bumped at all. Nothing errored; the version
simply did not move.

Naming one harness is enough: the `fixed` group in `.changeset/config.json`
carries the bump to all twelve.

### `Exclude` and `Omit`

Two of the four utility types had their second argument narrowed here —
`Exclude<T, U extends T>` and `Omit<T, K extends keyof T>`, against upstream's
`Exclude<T, U>` and `Omit<T, K extends keyof any>`. `Extract` and `Pick`
already matched.

Narrowing makes a choice on the caller's behalf, and only one of the two
readings is ever right for a given call. Subtracting keys a type may not have
is legitimate — upstream's own declarations do it — and under the narrowed
constraint it is a TS2344 that nothing can fix when the declaration lives
inside a dependency. Making the choice explicit belongs in the caller's code,
which is what `eslint-plugin-ts-type-forge`'s
`prefer-strict-or-relaxed-utility-type` does, pointing at `StrictOmit` /
`RelaxedOmit` and the rest.

Only widens what is accepted, so anything that compiled still does.

### Peer range

TypeScript 6.0.3 compiles the v7.0 lib set with `skipLibCheck: false` and no
errors, and resolves `@typescript/lib-*` by the same package-name lookup
TypeScript 7 uses, so one bundle serves both compilers. Without the wider
declaration npm refuses to install it beside TypeScript 6.
