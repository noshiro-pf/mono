# ts-codemod-lib

[![npm version](https://img.shields.io/npm/v/ts-codemod-lib.svg)](https://www.npmjs.com/package/ts-codemod-lib)
[![npm downloads](https://img.shields.io/npm/dm/ts-codemod-lib.svg)](https://www.npmjs.com/package/ts-codemod-lib)
[![License](https://img.shields.io/npm/l/ts-codemod-lib.svg)](https://github.com/noshiro-pf/mono/blob/main/libs/ts-codemod-lib/LICENSE)
[![codecov](https://codecov.io/gh/noshiro-pf/mono/graph/badge.svg?component=ts-codemod-lib)](https://codecov.io/gh/noshiro-pf/mono)

A TypeScript library for code transformations using AST (Abstract Syntax Tree) transformers, powered by the [ts-morph](https://github.com/dsherret/ts-morph).

## Overview

`ts-codemod-lib` provides utilities and ready-to-use transformers for automated TypeScript code transformations. It enables you to programmatically modify TypeScript source code through AST manipulation, making it ideal for large-scale refactoring tasks, enforcing type safety, and promoting immutability.

## Features

- **AST-based Transformations**: Leverage TypeScript Compiler API for reliable type-aware code transformations
- **Ready-to-use Transformers**: Append `as const`, convert to readonly types, replace `any` with `unknown`, and more
- **Extensible API**: Build custom transformers using the provided utilities
- **Type-safe**: Written in TypeScript with strict type checking
- **Selective Transformation**: Support for ignoring specific lines or entire files via comments

## Installation

```bash
# Using npm
npm add ts-codemod-lib

# Using pnpm
pnpm add ts-codemod-lib

# Using yarn
yarn add ts-codemod-lib
```

The command line tools live in a separate package:

```bash
npm add -D ts-codemod-cli
```

## Available Transformers

This library provides TypeScript AST transformers that can be used to automatically modify your TypeScript code. The transformers can be used individually or combined for more complex transformations.

### 1. `appendAsConstTransformer`

Appends `as const` to array literals and object literals to make them readonly constants. This transformer helps in creating immutable data structures by automatically adding the TypeScript `as const` assertion.

Options:

- `applyLevel`: `'all'` or `'avoidInFunctionArgs'` (default: `'avoidInFunctionArgs'`)
    - `'avoidInFunctionArgs'`: Avoids adding `as const` inside function call arguments
    - `'all'`: Applies `as const` everywhere
- `ignorePrefixes`: Array of string prefixes for identifiers that should not have `as const` added (default: `['mut_', '#mut_', '_mut_', 'draft']`)
- `removeAsConstForConstTypeParameters`: Whether to remove redundant `as const` assertions from call arguments whose corresponding parameter type is exactly a `const`-modified type parameter (default: `true`). Only applies when the callee resolves to a single call signature within the transformed file itself; imported callees, overloads, calls with explicit type arguments and spread arguments are left as they are.

Example:

```ts
// Before
const arr = [1, 2, 3];

const obj = { a: 1, b: 2 };

// After
const arr2 = [1, 2, 3] as const;

const obj2 = { a: 1, b: 2 } as const;
```

Example (`removeAsConstForConstTypeParameters`):

```ts
const f = <const T>(x: T): T => x;

// Before
const a = f([1, 2] as const);

// After (the `const` type parameter already infers `readonly [1, 2]`)
const a2 = f([1, 2]);
```

### 2. `convertToReadonlyTransformer`

Converts TypeScript type definitions to readonly types. This transformer helps in creating more type-safe code by making types readonly where appropriate. It also normalizes nested readonly types (e.g., `Readonly<Readonly<T>>` becomes `Readonly<T>`).

Options:

- `ignorePrefixes`: Array of string prefixes for identifiers that should not be made readonly (default: `['mut_', '#mut_', '_mut_', 'draft']`)
- `DeepReadonly.typeName`: Custom name for the DeepReadonly type utility (default: `"DeepReadonly"`)
- `recordStyle`: Output style used when making `Record<K, V>` readonly (default: `"ReadonlyRecord"`). `"ReadonlyRecord"` uses the `ReadonlyRecord` type utility provided by `ts-type-forge` (no import statement is added, so it has to be available in the transformed code, e.g. globally via `ts-type-forge`'s `global.d.mts`), while `"Readonly<Record>"` uses only built-in utility types (`Readonly<Record<K, V>>`). Whichever style is selected, `Record<K, V>`, `Readonly<Record<K, V>>`, `ReadonlyRecord<K, V>`, and redundant wrappers such as `Readonly<ReadonlyRecord<K, V>>` are all unified to that style.

Example:

```ts
// Before
type User = {
    id: number;
    description: string;
    preferences: Map<string, string>;
    friendIds: number[];
    mut_items: string[]; // With ignorePrefixes: ['mut_']
};

// After
type User2 = Readonly<{
    id: number;
    description: string;
    preferences: ReadonlyMap<string, string>;
    friendIds: readonly number[];
    mut_items: string[]; // Not made readonly due to 'mut_' prefix
}>;
```

For more detailed transformation examples, see the [test file](https://github.com/noshiro-pf/mono/blob/main/libs/ts-codemod-lib/src/functions/ast-transformers/convert-to-readonly.test.mts) which covers various scenarios including complex types, nested structures, and DeepReadonly transformations.

### 3. `convertInterfaceToTypeTransformer`

Converts TypeScript interface declarations to type aliases. This transformer helps in maintaining consistency by using type aliases throughout the codebase.

Example:

```ts
// Before
interface User {
    id: number;
    name: string;
}

// After
type User2 = {
    id: number;
    name: string;
};
```

### 4. `replaceAnyWithUnknownTransformer`

Replaces `any` type annotations with `unknown` for improved type safety. The `unknown` type requires type checking before operations, making your code more robust. For function parameters with rest arguments, `(...args: any) => R` is converted to `(...args: readonly unknown[]) => R`.

Example:

```ts
// Before
const getValue = (data: any): any => data.value;

const sortValues = (...args: any): any =>
    args.toSorted((a: any, b: any) => a - b);

// After
const getValue2 = (data: unknown): unknown => (data as any).value;

const sortValues2 = (...args: readonly unknown[]): unknown =>
    (args as any).toSorted((a: any, b: any) => a - b);
```

For more detailed transformation examples, see the [test file](https://github.com/noshiro-pf/mono/blob/main/libs/ts-codemod-lib/src/functions/ast-transformers/replace-any-with-unknown.test.mts) which covers various scenarios including function parameters, return types, and variable declarations.

### 5. `replaceRecordWithUnknownRecordTransformer`

Replaces `Record<string, unknown>` and `Readonly<Record<string, unknown>>` with `UnknownRecord` for better type safety and consistency. This transformer also handles index signatures `[k: string]: unknown` in interfaces and type literals.

Example:

```ts
// Before
type Config = Record<string, unknown>;

type ReadonlyConfig = Readonly<Record<string, unknown>>;

type Data = Record<string, unknown>;

// After
type Config2 = UnknownRecord;

type ReadonlyConfig2 = UnknownRecord;

type Data2 = UnknownRecord;
```

### 6. `enableNoUncheckedIndexedAccessTransformer`

Appends `!` to the index accesses that turning on
[`noUncheckedIndexedAccess`](https://www.typescriptlang.org/tsconfig/#noUncheckedIndexedAccess)
would turn into type errors, as a stopgap while the option is being enabled on
an existing codebase.

The rewrite is driven by the type checker rather than by syntax: each file is
checked twice, once with `noUncheckedIndexedAccess` off and once with it on,
and `!` is appended only where the option is what added `undefined` to the
expression's type. Consequently an index whose presence the type already
guarantees is left untouched — `[T, T][1]`, `[T, T, ...T[]][0]` and
`({ a: T })['a']` all keep their accesses as they are, as does an element type
that contained `undefined` to begin with, and so does an access a preceding
guard has already narrowed. `strictNullChecks` is turned on for both checks,
because `noUncheckedIndexedAccess` does nothing without it.

Both spellings of an index read are covered, because the option widens both:
`rec['a']` and the dotted `rec.a` of a type carrying an index signature. A
declared property is left alone either way, even on a type that also has an
index signature.

Options:

- `applyLevel`: `'all'` or `'avoidWhereUndefinedIsAllowed'` (default: `'all'`)
    - `'all'`: appends `!` to every read whose type the option widens with `undefined`, so that as few type errors as possible are left behind
    - `'avoidWhereUndefinedIsAllowed'`: additionally leaves the access alone where its contextual type already accepts `undefined` (e.g. `const x: number | undefined = xs[0];`, or an argument of a `(x: number | undefined) => void` parameter), which produces fewer but only load-bearing assertions

These positions are never rewritten, whichever level is selected:

- **Assignment targets**, where `!` is not valid syntax: `xs[0] = 1`, `xs[0] ??= 1`, `xs[0]++`, `--xs[0]`, `delete rec['a']`, `[xs[0]] = ys`, `for (xs[0] of ys)`.
- **Accesses that already account for `undefined`**: `xs[0]!`, `xs[0] as T`, `xs[0]?.foo`, `fns[0]?.()`, `xs[0] ?? d`, `xs[0] && d`.
- **Positions that read the value precisely to find out whether it is there**: `typeof xs[0]`, `!xs[0]`, `xs[0] === undefined`, and the condition of `if` / `while` / `do` / `for` / `?:`, and the subject of `switch` — asserting there would defeat the check (`case undefined:` stops compiling against an asserted subject).

Two things it cannot fix, which are left for a human to deal with:

- **Destructuring**, since `!` has nowhere to go in `const [head] = xs;` or `const { a } = rec;`.
- **Compound assignment**, `xs[0] += 1`, whose left-hand side is read as well as written.

Two things to know before running it:

- **Each file is transformed on its own**, as it is by every transformer in this library. A type that comes from another module does not resolve, and neither does a narrowing that depends on an imported type guard — `if (Arr.isNonEmpty(xs))` does not narrow `xs[0]` here. An unresolved type is never widened, so nothing is asserted there; a lost narrowing is the other way round, and produces an assertion the whole-program check does not need.
- **Review the diff, and let ESLint clean up after it.** An assertion the compiler can prove unnecessary is reported by [`@typescript-eslint/no-unnecessary-type-assertion`](https://typescript-eslint.io/rules/no-unnecessary-type-assertion/), whose fixer removes it, so running `eslint --fix` over the transformed files takes most of the surplus back out. What no rule can see is an assertion that makes a later check dead — `const v = xs[0]!; if (v === undefined) …` — which is why this is a stopgap rather than a fix.

Example:

```ts
const xs: readonly number[] = [1, 2, 3];

const pair: readonly [number, string] = [1, 'a'];

const rec: ReadonlyRecord<string, number> = { a: 1 };

// Before (with `noUncheckedIndexedAccess` on, only `pair[1]` is known to be there)
const first: number | undefined = xs[0];

const entry: number | undefined = rec['a'];

const second: string = pair[1];

// After (the two unchecked reads are asserted, the guaranteed index is left alone)
const first2: number = xs[0]!;

const entry2: number = rec['a']!;

const second2: string = pair[1];
```

### Disabling Transformers

- Nodes on the line immediately following a `// transformer-ignore-next-line` comment will be skipped.
    - You can specify transformer names to ignore: `// transformer-ignore-next-line append-as-const, replace-any-with-unknown`
    - If no transformer names are specified, all transformers will be skipped.
- Files containing a `/* transformer-ignore */` comment will be skipped entirely.

Examples:

**Example using `// transformer-ignore-next-line`:**

```ts
// Before
type Config = {
    apiKey: string;
    // transformer-ignore-next-line
    mutableOptions: string[]; // This line will not be made Readonly
    settings: { timeout: number };
};

// After applying convertToReadonlyTransformer
type Config2 = Readonly<{
    apiKey: string;
    // transformer-ignore-next-line
    mutableOptions: string[]; // Not made Readonly because it was skipped
    settings: Readonly<{ timeout: number }>;
}>;
```

**Example using `/* transformer-ignore */`:**

```ts
// Before
type Data = { value: any };

const items = [1, 2, 3];

// After applying any transformer (e.g., replaceAnyWithUnknownTransformer, appendAsConstTransformer)
// No changes will be made to this file.
type Data2 = { value: any };

const items2 = [1, 2, 3];
```

## Command Line Tools

The transformers are also available as commands, published separately as
[`ts-codemod-cli`](https://www.npmjs.com/package/ts-codemod-cli):

```bash
npm add -D ts-codemod-cli
npx convert-to-readonly 'src/**/*.mts'
```

They are in their own package because they need `cmd-ts`, `dedent` and
`ts-repo-utils` — dependencies this library does not otherwise carry. See that
package's README for the full command list and options.

## Programmatic Usage

### Using Transformers with String Input/Output

You can use the `astTransformerToStringTransformer` utility to apply these transformers to source code strings:

```tsx
import dedent from 'dedent';
import {
    appendAsConstTransformer,
    convertInterfaceToTypeTransformer,
    convertToReadonlyTransformer,
    replaceAnyWithUnknownTransformer,
    replaceRecordWithUnknownRecordTransformer,
    transformSourceCode,
} from 'ts-codemod-lib';

const originalCode = dedent`
  export interface A {
    name?: string;
    point: [x: number, y: number, z?: number];
    meta: {
      description?: string;
      tags: string[];
      attributes: Record<string, unknown>;
      data?: any;
    };
  }

  export const obj = {
    point: [1, 2],
    meta: {
      tags: ['example', 'test'],
      attributes: {
        key1: 'value1',
        key2: 42,
      },
    },
  } satisfies A;

  export const arr = ['a', {}, 0];
`;

const isTsx = false;

// Apply transformations to source code
const transformedCode = transformSourceCode(originalCode, isTsx, [
    convertInterfaceToTypeTransformer(),
    replaceRecordWithUnknownRecordTransformer(),
    convertToReadonlyTransformer(),
    appendAsConstTransformer(),
    replaceAnyWithUnknownTransformer(),
]);

const expected = dedent`
  import { type UnknownRecord } from "ts-type-forge";

  export type A = Readonly< {
    name?: string;
    point: (readonly  [x: number, y: number, z?: number]);
    meta: Readonly< {
        description?: string;
        tags: (readonly  string[]);
        attributes: UnknownRecord;
        data?: unknown;
      }>;
  }>;

  export const obj = {
    point: [1, 2],
    meta: {
      tags: ['example', 'test'],
      attributes: {
        key1: 'value1',
        key2: 42,
      },
    },
  } as const satisfies A;

  export const arr = ['a', {}, 0] as const;
`;

if (import.meta.vitest !== undefined) {
    test('transformSourceCode', () => {
        assert.strictEqual(transformedCode, expected);
    });
}
```

Note: It is recommended to apply all transformers at once using `transformSourceCode` rather than applying each transformer individually.
This is more efficient as it avoids the overhead of parsing and printing before and after applying each AST transformation.

### Apply Transformers to `src` Directory

```tsx
import * as fs from 'node:fs/promises';
import {
    appendAsConstTransformer,
    convertInterfaceToTypeTransformer,
    convertToReadonlyTransformer,
    replaceAnyWithUnknownTransformer,
    replaceRecordWithUnknownRecordTransformer,
    transformSourceCode,
} from 'ts-codemod-lib';

for await (const filePath of fs.glob('path/to/src/**/*.{mts,tsx}')) {
    if (filePath.endsWith('.d.mts')) {
        console.log(`Skipping declaration file: ${filePath}`);

        continue;
    }

    console.log(`Processing file: ${filePath}`);

    const originalCode = await fs.readFile(filePath, 'utf8');

    const isTsx = filePath.endsWith('.tsx') || filePath.endsWith('.jsx');

    // Apply transformations to source code
    const transformedCode = transformSourceCode(originalCode, isTsx, [
        convertInterfaceToTypeTransformer(),
        replaceRecordWithUnknownRecordTransformer(),
        convertToReadonlyTransformer(),
        appendAsConstTransformer(),
        replaceAnyWithUnknownTransformer(),
    ]);

    await fs.writeFile(filePath, transformedCode, 'utf8');
}
```

Run:

```sh
node codemod.mjs
```

## Notes

- Types within JSDoc comments are not transformed.

    ```ts
    // Before
    /**
     * Processes user data.
     * @param {object} user - The user object.
     * @param {string[]} user.roles - User roles.
     * @returns {object} Processed data.
     */
    function processUser(user: { name: string; roles: string[] }): {
        success: boolean;
    } {
        // ... implementation ...
        return { success: true };
    }

    // After applying convertToReadonlyTransformer
    /**
     * Processes user data.
     * @param {object} user - The user object. // JSDoc type is not changed
     * @param {string[]} user.roles - User roles. // JSDoc type is not changed
     * @returns {object} Processed data. // JSDoc type is not changed
     */
    function processUser(
        user: Readonly<{ name: string; roles: readonly string[] }>,
    ): Readonly<{ success: boolean }> {
        // ... implementation ...
        return { success: true };
    }
    ```

- Comment positions might change due to the heuristics used for restoring comments in the code.
    - When parsing source code into an AST using the TypeScript Compiler API, comments are often attached to the preceding or succeeding node. However, sometimes comments become detached (orphaned). These detached comments might be omitted when the source code string is generated by TypeScript's printer (though some might be restored). `ts-codemod-lib` includes preprocessing to identify all detached comments that the printer cannot restore and reattaches them to the immediately preceding or succeeding node, making them printable. However, the determination of whether to attach the comment before or after the node is heuristic, so the comment might move to a different position than in the original code.
    - Possible workarounds include experimenting to find comment positions less likely to become orphaned (comments clearly preceding a node are less likely to be orphaned) or excluding the relevant section from transformation using the `// transformer-ignore-next-line` comment.
    - I intend to resolve practical issues as much as possible, so please submit an issue if you find any problems.
    - Related link: <https://github.com/microsoft/TypeScript/issues/20506#issuecomment-349740820>

## Documentation

- API reference: <https://noshiro-pf.github.io/ts-codemod-lib/>

## For Developers

### Local Setup

```sh
git clone https://github.com/noshiro-pf/mono.git
pnpm i
```

### Resources

- <https://ts-ast-viewer.com/#>
- <https://github.com/itsdouges/typescript-transformer-handbook>
- <https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API>
- <https://blog.nnn.dev/entry/2022/03/10/110000>
