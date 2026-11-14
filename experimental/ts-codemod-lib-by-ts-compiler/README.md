<!--
Provenance note added on import. Everything below the horizontal rule is the
original README, verbatim.
-->

> **Archived copy — nothing here is wired into this repository.**
>
> The first version of `ts-codemod-lib`, written against the TypeScript
> Compiler API before the library was rewritten on ts-morph (today's
> `libs/ts-codemod-lib`). The Zenn article
> `articles/typescript-codemod-development.md` describes it as the
> "TypeScript Compiler API で作った不完全作".
>
> Imported from commit `a67e689168e4bd161d4e4f05786d03146e9b05a5`
> (2025-04-13, "feat: create ts-codemod-lib"), path
> `packages/utils/ts-codemod-lib/`. That commit is the head of the closed,
> unmerged pull request #1479 (`create-codemod-lib`) and is reachable only
> through `refs/pull/1479/head`: it is on no branch, and `main` never held the
> code. Nor does `archive/develop`: it is not `develop`'s original history but
> 20 of its commits replayed onto `main` in 2026-08, starting from "create
> experimental/tsfmt", and none of them touches `ts-codemod-lib`. It is the
> only copy found: every branch, tag and pull request head on GitHub was
> searched for it, and so was a clone's object database, unreachable objects
> included.
>
> **This is not the version the article links.** The article's links pointed
> into `develop` at `experimental/ts-codemod-lib`, including
> `src/functions/transform-source-code.mts`, which the article describes as
> the scanner-based attempt to re-attach the comments that parsing and
> re-printing drop. No commit of that state survives, so how it got there from
> this snapshot is known only from those links. This snapshot has
> `emptyLineEncoder` (`src/utils/empty-line-encoder.mts`), the transformers and
> the ignore comments (`src/functions/has-disable-next-line-comment.mts`), not
> the re-attachment of comments.
>
> The package's files are taken whole, its configs included: they are this
> package's own, not a template's, and say how it was built and tested. Two
> things differ from the commit: `package.json` is renamed
> `package.snapshot.json` (see `experimental/README.md`), and the commit's one
> line outside the package, registering it in `packages/workspace-config.mts`,
> is left behind. It lives under `experimental/`, outside the pnpm workspace
> globs and excluded from ESLint, tsc, knip, Prettier, cspell and
> markdownlint, so nothing here is installed, built or checked; its configs
> extend files of the old monorepo (`../../../configs/...`) that do not exist
> here, and it imports `@noshiro/ts-utils`, today's `ts-data-forge`.

---

# ts-codemod-lib

A TypeScript library for code transformations using AST (Abstract Syntax Tree) transformers.

## Installation

```bash
# Using yarn
yarn add ts-codemod-lib

# Using npm
npm install ts-codemod-lib
```

## Features

This library provides TypeScript AST transformers that can be used to automatically modify your TypeScript code. The transformers can be used individually or combined for more complex transformations.

### Available Transformers

#### 1. `appendAsConstTransformer`

Appends `as const` to array literals and object literals to make them readonly constants. This transformer helps in creating immutable data structures by automatically adding the TypeScript `as const` assertion.

Example:

```typescript
// Before
const arr = [1, 2, 3];
const obj = { a: 1, b: 2 };

// After
const arr = [1, 2, 3] as const;
const obj = { a: 1, b: 2 } as const;
```

#### 2. `convertToReadonlyTypeTransformer`

Converts TypeScript type definitions to readonly types. This transformer helps in creating more type-safe code by making types readonly where appropriate. It also normalizes nested readonly types (e.g., `Readonly<Readonly<T>>` becomes `Readonly<T>`).

Options:

-   `ignorePrefixes`: Array of string prefixes for identifiers that should not be made readonly
-   `DeepReadonlyTypeName`: Custom name for the DeepReadonly type utility (defaults to "DeepReadonly")

Example:

```typescript
// Before
type User = {
    id: number;
    description: string;
    preferences: Map<string, string>;
    friendIds: number[];
    mut_items: string[]; // With ignorePrefixes: ['mut_']
};

// After
type User = Readonly<{
    id: number;
    description: string;
    preferences: ReadonlyMap<string, string>;
    friendIds: readonly number[];
    mut_items: string[]; // Not made readonly due to 'mut_' prefix
}>;
```

For more detailed transformation examples, see the [test file](./src/ast-transformers/convert-to-readonly-type.test.mts) which covers various scenarios including complex types, nested structures, and DeepReadonly transformations.

#### 3. `replaceAnyWithUnknownTransformer`

Replaces `any` type annotations with `unknown` for improved type safety. The `unknown` type requires type checking before operations, making your code more robust. For function parameters with rest arguments, `(...args: any) => R` is converted to `(...args: readonly unknown[]) => R`.

Example:

```typescript
// Before
const getValue = (data: any): any => {
    return data.value;
};

const sortValues = (...args: any): any => {
    return args.toSorted((a, b) => a - b);
};

// After
const getValue = (data: unknown): unknown => {
    return data.value; // This will now cause a type error, requiring proper type checking
};

const sortValues = (...args: readonly unknown[]): unknown => {
    return args.toSorted((a, b) => a - b); // This will now cause a type error, requiring proper type checking
};
```

For more detailed transformation examples, see the [test file](./src/ast-transformers/replace-any-with-unknown.test.mts) which covers various scenarios including function parameters, return types, and variable declarations.

### Using Transformers with String Input/Output

You can use the `astTransformerToStringTransformer` utility to apply these transformers to source code strings:

```typescript
import {
    astTransformerToStringTransformer,
    appendAsConstTransformer,
    convertToReadonlyTypeTransformer,
    replaceAnyWithUnknownTransformer,
} from 'ts-codemod-lib';

// Source code to transform
const sourceCode = `
type User = {
    id: number;
    description: string;
    preferences: Map<string, string>;
    friendIds: number[];
    mut_items: string[];
};

const defaultUser = {
    id: 1,
    name: 'Anonymous',
    preferences: new Map(),
    mut_items: []
};
`;

// Create a string transformer by combining multiple AST transformers
// It's recommended to apply all transformers at once for better performance
const stringTransformer = astTransformerToStringTransformer([
    replaceAnyWithUnknownTransformer,
    appendAsConstTransformer,
    convertToReadonlyTypeTransformer(),
]);

// Apply the transformation
const transformedCode = stringTransformer(sourceCode);

console.log(transformedCode);
// Output:
// type User = Readonly<{
//     id: number;
//     description: string;
//     preferences: ReadonlyMap<string, string>;
//     friendIds: readonly number[];
//     mut_items: string[];
// }>;

// const defaultUser = {
//     id: 1,
//     name: 'Anonymous',
//     preferences: new Map(),
//     mut_items: []
// } as const;
```

Note: It is recommended to apply all transformers at once using `astTransformerToStringTransformer` rather than applying each transformer individually using `astTransformerToStringTransformer`.
This is more efficient as it avoids the overhead of parsing and printing before and after applying each AST transformation.
