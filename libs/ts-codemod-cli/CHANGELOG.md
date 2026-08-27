# ts-codemod-cli

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
