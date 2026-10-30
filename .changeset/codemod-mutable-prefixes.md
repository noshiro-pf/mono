---
'ts-codemod-lib': major
'ts-codemod-cli': major
---

The `ignorePrefixes` option is replaced, and `mut_` is the only default prefix (for a type name, `Mutable` as well).

- `convert-to-readonly`: `ignorePrefixes` is split into `mutableVariablePrefixes` (the names of variables, parameters and functions), `mutableTypePrefixes` (the names of type aliases, interfaces and classes, a named class expression now included) and `mutablePropertyPrefixes` (the names of properties, constructor parameter properties, methods and accessors, a private `#mut_x` included, and of named tuple members). Pass the same list to all three for the old behavior, leaving out an entry that starts with `#`: such an entry used to match no private name, and now matches one.
- `append-as-const`: `ignorePrefixes` is renamed to `mutableVariablePrefixes`, and the new `mutableTypePrefixes` leaves without `as const` a variable whose type annotation names a type of such a name (`const config: MutableConfig = { … }`), an expression that `satisfies` one and the expression body of an arrow function returning one, which `as const` would make unassignable; `mutableVariablePrefixes` does the same for `typeof mut_x`. Pass `mutableTypePrefixes: []` to drop the type-name check (the `typeof` one stays with `mutableVariablePrefixes`).
- Setting `ignorePrefixes` now throws.
- `mutableTypePrefixes` defaults to `['Mutable', 'mut_']`, `Mutable` suiting the PascalCase of type names. `type mut_Config` is left mutable as before, and **a type alias, interface or class named `Mutable…` (`type MutableConfig = { items: string[] }`) is now left mutable too**, where it used to be made readonly; pass `mutableTypePrefixes: ['mut_']` to keep converting it (with `ts-codemod-cli`, rename it). The default is exported as `DEFAULT_MUTABLE_TYPE_PREFIXES`.
- The other defaults are `['mut_']`, instead of `['mut_', '#mut_', '_mut_', 'draft']`. A private name `#mut_x` is still left mutable, because it is matched after its `#` (and, an entry such as `#mut_` given in the options, with it). A name starting with `draft` or `_mut_`, or a quoted `'#mut_x'`, is no longer: `const draft = { … }` gets `as const`, a parameter `draft: Item[]` becomes `draft: readonly Item[]`, and a type literal with a `draft` property is wrapped with `Readonly<...>`. Rename it (`mut_draft`, `mut_x`), name the prefix in the options, or put `// transformer-ignore-next-line convert-to-readonly, append-as-const` above the declaration (above the whole type for a property of a type literal). The default is exported as `DEFAULT_MUTABLE_PREFIXES`.

`ts-codemod-cli` has no option for the prefixes and uses the new defaults; rename or use the ignore comment.
