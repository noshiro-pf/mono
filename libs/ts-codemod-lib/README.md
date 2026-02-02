# ts-codemod-lib

[![npm version](https://img.shields.io/npm/v/ts-codemod-lib.svg)](https://www.npmjs.com/package/ts-codemod-lib)
[![npm downloads](https://img.shields.io/npm/dm/ts-codemod-lib.svg)](https://www.npmjs.com/package/ts-codemod-lib)
[![License](https://img.shields.io/npm/l/ts-codemod-lib.svg)](./LICENSE)
[![codecov](https://codecov.io/gh/noshiro-pf/ts-codemod-lib/graph/badge.svg?token=BVx5UgsiVr)](https://codecov.io/gh/noshiro-pf/ts-codemod-lib)

A TypeScript library for code transformations using AST (Abstract Syntax Tree) transformers, powered by the TypeScript Compiler API.

## Overview

`ts-codemod-lib` provides utilities and ready-to-use transformers for automated TypeScript code transformations. It enables you to programmatically modify TypeScript source code through AST manipulation, making it ideal for large-scale refactoring tasks, enforcing type safety, and promoting immutability.

## Features

- **AST-based Transformations**: Leverage TypeScript Compiler API for reliable type-aware code transformations
- **Ready-to-use Transformers**: Append `as const`, convert to readonly types, replace `any` with `unknown`, and more
- **Ready-to-use CLI Tools**: Convert interfaces to types, add readonly modifiers, and more
- **Extensible API**: Build custom transformers using the provided utilities
- **Type-safe**: Written in TypeScript with strict type checking
- **Selective Transformation**: Support for ignoring specific lines or entire files via comments

## Installation

```bash
# Using npm
npm install -D ts-codemod-lib

# Using pnpm
pnpm add -D ts-codemod-lib

# Using yarn
yarn add -D ts-codemod-lib
```

## Available Transformers

This library provides TypeScript AST transformers that can be used to automatically modify your TypeScript code. The transformers can be used individually or combined for more complex transformations.

### 1. `appendAsConstTransformer`

Appends `as const` to array literals and object literals to make them readonly constants. This transformer helps in creating immutable data structures by automatically adding the TypeScript `as const` assertion.

Example:

```ts
// Before
const arr = [1, 2, 3];

const obj = { a: 1, b: 2 };

// After
const arr2 = [1, 2, 3] as const;

const obj2 = { a: 1, b: 2 } as const;
```

### 2. `convertToReadonlyTypeTransformer`

Converts TypeScript type definitions to readonly types. This transformer helps in creating more type-safe code by making types readonly where appropriate. It also normalizes nested readonly types (e.g., `Readonly<Readonly<T>>` becomes `Readonly<T>`).

Options:

- `ignorePrefixes`: Array of string prefixes for identifiers that should not be made readonly
- `DeepReadonlyTypeName`: Custom name for the DeepReadonly type utility (defaults to "DeepReadonly")

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

For more detailed transformation examples, see the [test file](./src/functions/ast-transformers/convert-to-readonly-type.test.mts) which covers various scenarios including complex types, nested structures, and DeepReadonly transformations.

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

For more detailed transformation examples, see the [test file](./src/functions/ast-transformers/replace-any-with-unknown.test.mts) which covers various scenarios including function parameters, return types, and variable declarations.

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

### Disabling Transformers

- Nodes on the line immediately following a `// transformer-ignore-next-line` comment will be skipped.
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

// After applying convertToReadonlyTypeTransformer
type Config2 = Readonly<{
    apiKey: string;
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

## CLI Tools

This package provides command-line tools for common TypeScript transformations:

### append-as-const

Appends `as const` to array literals and object literals to make them readonly constants.

```bash
npx append-as-const <baseDir> [--exclude <pattern>] [--silent]
```

### convert-interface-to-type

Converts TypeScript interface declarations to type aliases.

```bash
npx convert-interface-to-type <baseDir> [--exclude <pattern>] [--silent]
```

### convert-to-readonly

Adds `readonly` modifiers to type definitions throughout your codebase.

```bash
npx convert-to-readonly <baseDir> [--exclude <pattern>] [--silent]
```

### replace-any-with-unknown

Replaces `any` type annotations with `unknown` for improved type safety.

```bash
npx replace-any-with-unknown <baseDir> [--exclude <pattern>] [--silent]
```

### replace-record-with-unknown-record

Replaces `Record<string, unknown>` with `UnknownRecord` for better type safety.

```bash
npx replace-record-with-unknown-record <baseDir> [--exclude <pattern>] [--silent]
```

**Common Options:**

- `baseDir`: Base directory to scan for TypeScript files
- `--exclude`: Glob patterns to exclude (e.g., `"src/generated/**/*.mts"`)
- `--silent`: Suppress output messages

## Programmatic Usage

### Using Transformers with String Input/Output

You can use the `astTransformerToStringTransformer` utility to apply these transformers to source code strings:

```tsx
import dedent from 'dedent';
import {
    appendAsConstTransformer,
    convertInterfaceToTypeTransformer,
    convertToReadonlyTypeTransformer,
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
    convertToReadonlyTypeTransformer(),
    appendAsConstTransformer(),
    replaceAnyWithUnknownTransformer(),
]);

const expected = dedent`
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
        assert.isTrue(transformedCode === expected);
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
    convertToReadonlyTypeTransformer,
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
        convertToReadonlyTypeTransformer(),
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

    // After applying convertToReadonlyTypeTransformer
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
git clone https://github.com/noshiro-pf/ts-codemod-lib.git
git submodule update --init --recursive
pnpm i
```

### Syncing AGENTS.md Updates

1. Update `AGENTS.md` in the common repository (`common-agent-config`)
2. Update the submodule in each project

```bash
git submodule update --remote --merge
git add agents/common
git commit -m "Update AGENTS.md"
```

### Resources

- <https://ts-ast-viewer.com/#>
- <https://github.com/itsdouges/typescript-transformer-handbook>
- <https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API>
- <https://blog.nnn.dev/entry/2022/03/10/110000>
