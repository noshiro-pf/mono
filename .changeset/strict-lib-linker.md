---
'strict-ts-lib-v5.0-source': patch
---

Ship a linker with every strict standard library bundle, so the packages for
TypeScript 6 and earlier can be used at all.

Those versions resolve `@typescript/lib-*` as ordinary package names, through
a fixed Node10 lookup that ignores `paths` — and a single package shipping
every lib as a subdirectory has no name for them to find. `npx <package>-link`
supplies the names, as one symlink per lib group under
`node_modules/@typescript/`. TypeScript 7 is unchanged: it reads `paths` and
no longer does the name lookup.
