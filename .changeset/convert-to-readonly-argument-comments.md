---
'ts-codemod-lib': patch
---

`convert-to-readonly` keeps a comment written just before the `,` or `>` of a type argument when it rewrites `Set`, `Map`, `Record`, `ReadonlyRecord` or `Readonly<Record<…>>` (`Map<K /* x */, V /* y */>` becomes `ReadonlyMap<K /* x */, V /* y */>` instead of losing both), and a `// …` comment there keeps its line break.
