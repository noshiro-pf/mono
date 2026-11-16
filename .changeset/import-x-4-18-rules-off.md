---
'eslint-config-typed': patch
---

Update `eslint-plugin-import-x` to 4.18.0 and turn off its new rules (`avoid-barrel-files`, `avoid-importing-barrel-files`, `avoid-namespace-import`, `avoid-re-export-all`). `import-x/extensions` no longer checks an import written with `.js` or `.jsx`, which 4.18.0 would otherwise report even where it names a `.ts` / `.tsx` module; such an import of a real JavaScript file or a package subpath, which 4.17 reported, is accepted too
