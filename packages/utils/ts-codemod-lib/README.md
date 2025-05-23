# ts-codemod-lib

A TypeScript library for code transformations using AST (Abstract Syntax Tree) transformers.

## Installation

```bash
# Using yarn
yarn add -D ts-codemod-lib

# Using npm
npm install -D ts-codemod-lib
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

### Disabling Transformers

-   Nodes on the line immediately following a `// transformer-ignore-next-line` comment will be skipped.
-   Files containing a `/* transformer-ignore */` comment will be skipped entirely.

Examples:

**Example using `// transformer-ignore-next-line`:**

```typescript
// Before
type Config = {
    apiKey: string;
    // transformer-ignore-next-line
    mutableOptions: string[]; // This line will not be made Readonly
    settings: { timeout: number };
};

// After applying convertToReadonlyTypeTransformer
type Config = Readonly<{
    apiKey: string;
    mutableOptions: string[]; // Not made Readonly because it was skipped
    settings: Readonly<{ timeout: number }>;
}>;
```

**Example using `/* transformer-ignore */`:**

```typescript
/* transformer-ignore */
// This entire file will not be processed by transformers.

// Before
type Data = { value: any };
const items = [1, 2, 3];

// After applying any transformer (e.g., replaceAnyWithUnknownTransformer, appendAsConstTransformer)
// No changes will be made to this file.
type Data = { value: any };
const items = [1, 2, 3];
```

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

### Apply transformers to `src` directory.

```sh
npm install -D glob prettier
```

```js
// codemod.mjs

import { glob } from 'glob';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import * as prettier from 'prettier';
import {
    appendAsConstTransformer,
    convertToReadonlyTypeTransformer,
    replaceAnyWithUnknownTransformer,
    transformSourceCode,
} from 'ts-codemod-lib';

const thisScriptDir = import.meta.dirname;

const srcDir = path.resolve(thisScriptDir, './path/to/src');

const srcFileList = await glob(`${srcDir}/**/*.mts`);

const srcFileListFiltered = srcFileList.filter(
    (s) =>
        // Ignore files by specifying a regular expression, listing them in a Set, etc.
        !s.endsWith('.d.mts'),
);

console.log('srcDir', srcDir);
console.log('target files: ', srcFileList);

await Promise.all(
    srcFileListFiltered.map(async (filePath) => {
        const content = await fs.readFile(filePath, { encoding: 'utf8' });

        const options = await prettier.resolveConfig(filePath);

        const contentTransformed = transformSourceCode(
            content,
            [
                replaceAnyWithUnknownTransformer,
                appendAsConstTransformer(),
                convertToReadonlyTypeTransformer(),
            ],
            {
                ext: path.extname(filePath),
                tsconfig: {
                    searchPath: path.dirname(filePath),
                },
            },
        );

        const contentFormatted = await prettier.format(contentTransformed, {
            ...options,
            filepath: filePath,
        });

        await fs.writeFile(filePath, contentFormatted);

        console.log(
            `${filePath} converted. ${content === contentFormatted ? '(unchanged)' : '(changed)'}`,
        );
    }),
);
```

Run

```sh
node codemod.mjs
```

## Notes

-   Types within JSDoc comments are not transformed.

    ```typescript
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

-   Comment positions might change due to the heuristics used for restoring comments in the code.
    -   When parsing source code into an AST using the TypeScript Compiler API, comments are often attached to the preceding or succeeding node. However, sometimes comments become detached (orphaned). These detached comments might be omitted when the source code string is generated by TypeScript's printer (though some might be restored). `ts-codemod-lib` includes preprocessing to identify all detached comments that the printer cannot restore and reattaches them to the immediately preceding or succeeding node, making them printable. However, the determination of whether to attach the comment before or after the node is heuristic, so the comment might move to a different position than in the original code.
    -   Possible workarounds include experimenting to find comment positions less likely to become orphaned (comments clearly preceding a node are less likely to be orphaned) or excluding the relevant section from transformation using the `// transformer-ignore-next-line` comment.
    -   I intend to resolve practical issues as much as possible, so please submit an issue if you find any problems.
    -   Related link: https://github.com/microsoft/TypeScript/issues/20506#issuecomment-349740820
