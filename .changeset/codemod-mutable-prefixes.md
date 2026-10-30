---
'ts-codemod-lib': major
'ts-codemod-cli': major
---

The `ignorePrefixes` option is replaced, and `mut_` is the only default prefix.

- `convert-to-readonly`: `ignorePrefixes` is split into `mutableVariablePrefixes` (the names of variables, parameters, functions, type aliases, interfaces and classes) and `mutablePropertyPrefixes` (the names of properties, constructor parameter properties, methods and accessors, a private `#mut_x` included, and of named tuple members). Pass the same list to both for the old behavior, leaving out an entry that starts with `#`: such an entry used to match no private name, and now matches one.
- `append-as-const`: `ignorePrefixes` is renamed to `mutableVariablePrefixes`.
- Setting `ignorePrefixes` now throws.
- The defaults are `['mut_']` for all three, instead of `['mut_', '#mut_', '_mut_', 'draft']`. A private name `#mut_x` is still left mutable, because it is matched after its `#` (and, an entry such as `#mut_` given in the options, with it). A name starting with `draft` or `_mut_`, or a quoted `'#mut_x'`, is no longer: `const draft = { … }` gets `as const`, a parameter `draft: Item[]` becomes `draft: readonly Item[]`, and a type literal with a `draft` property is wrapped with `Readonly<...>`. Rename it (`mut_draft`, `mut_x`), name the prefix in the options, or put `// transformer-ignore-next-line convert-to-readonly, append-as-const` above the declaration (above the whole type for a property of a type literal). The default is exported as `DEFAULT_MUTABLE_PREFIXES`.

`ts-codemod-cli` has no option for the prefixes and uses the new defaults; rename or use the ignore comment.
