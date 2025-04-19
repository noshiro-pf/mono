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
