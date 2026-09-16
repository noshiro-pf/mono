---
'eslint-config-typed': patch
---

fix: resolve `types@>=X.Y` export conditions in the import resolver

A package may choose its declaration file by the compiler's own version —
jotai 3 ships `"types@>=5.5": "./dist/index.d.ts"` next to a plain `"types"`
pointing at a stub whose whole content is its own file name. TypeScript reads
the versioned key; the resolver behind `import-x/resolver` matches condition
names as literal strings, so it took the plain `"types"` branch and resolved
every subpath of such a package to that one stub. Two imports from one package
then looked like the same module to `import-x/no-duplicates`, whose fixer
merged them into an import naming things the entry point does not export.

The config now states the `types@>=X.Y` conditions the running TypeScript
satisfies, so those packages resolve to their real declarations.
