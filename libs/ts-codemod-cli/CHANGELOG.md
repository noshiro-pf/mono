# ts-codemod-cli

## 3.0.0

### Major Changes

- 4254692: The `ignorePrefixes` option is replaced, and `mut_` is the only default prefix (for a type name, `Mutable` as well).

    - `convert-to-readonly`: `ignorePrefixes` is split into `mutableVariablePrefixes` (the names of variables, parameters and functions), `mutableTypePrefixes` (the names of type aliases, interfaces and classes, a named class expression now included) and `mutablePropertyPrefixes` (the names of properties, constructor parameter properties, methods and accessors, a private `#mut_x` included, and of named tuple members). Pass the same list to all three for the old behavior, leaving out an entry that starts with `#`: such an entry used to match no private name, and now matches one.
    - `append-as-const`: `ignorePrefixes` is renamed to `mutableVariablePrefixes`, and the new `mutableTypePrefixes` leaves without `as const` a variable whose type annotation names a type of such a name (`const config: MutableConfig = { … }`), an expression that `satisfies` one and the expression body of an arrow function returning one, which `as const` would make unassignable; `mutableVariablePrefixes` does the same for `typeof mut_x`. Pass `mutableTypePrefixes: []` to drop the type-name check (the `typeof` one stays with `mutableVariablePrefixes`).
    - Setting `ignorePrefixes` now throws.
    - `mutableTypePrefixes` defaults to `['Mutable', 'mut_']`, `Mutable` suiting the PascalCase of type names. `type mut_Config` is left mutable as before, and **a type alias, interface or class named `Mutable…` (`type MutableConfig = { items: string[] }`) is now left mutable too**, where it used to be made readonly; pass `mutableTypePrefixes: ['mut_']` to keep converting it (with `ts-codemod-cli`, rename it). The default is exported as `DEFAULT_MUTABLE_TYPE_PREFIXES`.
    - The other defaults are `['mut_']`, instead of `['mut_', '#mut_', '_mut_', 'draft']`. A private name `#mut_x` is still left mutable, because it is matched after its `#` (and, an entry such as `#mut_` given in the options, with it). A name starting with `draft` or `_mut_`, or a quoted `'#mut_x'`, is no longer: `const draft = { … }` gets `as const`, a parameter `draft: Item[]` becomes `draft: readonly Item[]`, and a type literal with a `draft` property is wrapped with `Readonly<...>`. Rename it (`mut_draft`, `mut_x`), name the prefix in the options, or put `// transformer-ignore-next-line convert-to-readonly, append-as-const` above the declaration (above the whole type for a property of a type literal). The default is exported as `DEFAULT_MUTABLE_PREFIXES`.

    `ts-codemod-cli` has no option for the prefixes and uses the new defaults; rename or use the ignore comment.

### Patch Changes

- Updated dependencies [4254692]
    - ts-codemod-lib@4.0.0

## 2.1.2

### Patch Changes

- fd63446: `--version` reports the version of the package the command was installed from.

    Every CLI in these packages now resolves its version from its own
    `package.json` when it starts, rather than printing a string held in the
    source. The value a command prints and the version a consumer installed are
    the same thing by construction, so a release cannot move one without the
    other.

    `prepare-release` and `sync-cli-versions`, which carried the version into the
    sources, are removed along with the string they maintained. Nothing else
    called them.

- Updated dependencies [fd63446]
    - ts-repo-utils@10.7.1

## 2.1.1

### Patch Changes

- 30de8fa: Build with the native TypeScript compiler and drop Rollup. Each module in `dist/` is emitted by `tsc` as written, then the type tests, the in-source tests, the identity casts and the comments are removed from it. The declarations are unchanged, every module exports the same names as before, and the JavaScript is smaller: 1437 KB across these packages before, 1041 KB after.

    Two things change in the published JavaScript. `export` declarations appear inline rather than in a trailing `export { ... }` list, and the line structure is the source's rather than a bundler's, so a stack trace or a source map lands where the code was written.

    `github-settings-as-code` was already compiled by `tsc`; what it gains here is the removal pass, so its `dist/` no longer carries `expectType(...)` calls.

- Updated dependencies [30de8fa]
- Updated dependencies [8c955e1]
- Updated dependencies [30de8fa]
    - ts-codemod-lib@3.3.1
    - ts-data-forge@14.6.3
    - ts-repo-utils@10.6.0

## 2.1.0

### Minor Changes

- e3697cf: New `enableNoUncheckedIndexedAccessTransformer`, available from the CLI as
  `--transformer enable-no-unchecked-indexed-access`: it appends `!` to the index
  accesses that turning on `noUncheckedIndexedAccess` would turn into type
  errors, as a stopgap while the option is being enabled on an existing codebase.

    The rewrite is driven by the type checker rather than by syntax. Each file is
    checked twice, once with `noUncheckedIndexedAccess` off and once with it on,
    and `!` is appended only where the option is what added `undefined` to the
    expression's type — so an index whose presence the type already guarantees
    keeps its access as it is (`[T, T][1]`, `[T, T, ...T[]][0]`, `({ a: T })['a']`),
    as does an element type that contained `undefined` to begin with, and so does
    an access a preceding guard has already narrowed.

    Positions where an assertion would be invalid or would defeat a check are left
    alone: assignment targets (`xs[0] = 1`, `xs[0]++`, `delete rec['a']`), accesses
    that already account for `undefined` (`xs[0]!`, `xs[0] as T`, `xs[0]?.foo`,
    `xs[0] ?? d`), and the places that read a value precisely to find out whether
    it is there (`typeof`, `!x`, `=== undefined`, conditions, `switch` subjects).
    The new `applyLevel` option (`'all'` by default) can be set to
    `'avoidWhereUndefinedIsAllowed'` to additionally skip the reads whose
    contextual type already accepts `undefined`.

    Destructuring (`const [head] = xs;`) and compound assignment (`xs[0] += 1`) are
    the two cases it cannot fix, since `!` has nowhere to go in either.

    The result is a stopgap and wants reviewing. Each file is transformed on its
    own, as it is by every transformer here, so a narrowing that depends on an
    imported type guard is invisible and produces an assertion the whole-program
    check does not need; `eslint --fix` takes most of those back out through
    `@typescript-eslint/no-unnecessary-type-assertion`.

### Patch Changes

- Updated dependencies [e3697cf]
    - ts-codemod-lib@3.3.0

## 2.0.0

### Major Changes

- 9dc640d: **BREAKING**: the five per-transformer executables — `append-as-const`,
  `convert-interface-to-type`, `convert-to-readonly`, `replace-any-with-unknown`
  and `replace-record-with-unknown-record` — are replaced by a single
  `ts-codemod` command that takes the transformers as options:

    ```sh
    # before
    npx append-as-const 'src/**/*.mts'
    npx convert-to-readonly 'src/**/*.mts'

    # after
    npx ts-codemod -t append-as-const -t convert-to-readonly 'src/**/*.mts'
    ```

    `--transformer` (`-t`) is given once per transformer and every other option is
    unchanged. The point of the change is the pass count: each executable ran
    `runTransformerCLI` with a one-element array, so applying two transformers to
    the same files read, parsed and wrote every file twice. One command applies all
    of the selected transformers to a file in a single parse, in the order given.

    Passing no `--transformer` is an error, and a transformer named twice is applied
    once.

### Patch Changes

- Updated dependencies [02d1a37]
- Updated dependencies [83f8e36]
    - ts-codemod-lib@3.1.1
    - ts-repo-utils@10.3.2

## 1.0.1

### Patch Changes

- Updated dependencies [3d6bca7]
- Updated dependencies [3d6bca7]
- Updated dependencies [3d6bca7]
- Updated dependencies [5e2a339]
    - ts-codemod-lib@3.0.0
    - ts-data-forge@14.2.1
    - ts-repo-utils@10.2.0
