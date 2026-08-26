---
'ts-type-forge': patch
---

Document the second way to load the ambient globals: naming
`ts-type-forge/global` in the tsconfig's `compilerOptions.types`, which opts the
whole program in without adding a source file for the triple-slash directive.
The README now presents both forms together, with the two things that catch
people out — `types` replaces TypeScript's automatic `@types` inclusion rather
than adding to it, and either form needs a `moduleResolution` that reads the
package's `exports` map (`node16`, `nodenext` or `bundler`).

The tsconfig form is checked against the built `dist/` output on every build, by
a harness alongside the one that covers the triple-slash directive.
