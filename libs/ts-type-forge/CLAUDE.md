# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development Commands

- **Build**: `npm run build` - Generates the root index file with all type references
- **Type Check**: `npm run tsc` or `npm run type-check` - Runs TypeScript compiler without emitting files
- **Lint**: `npm run lint` - Runs ESLint on the codebase
- **Lint Fix**: `npm run lint:fix` - Auto-fixes linting issues
- **Format**: `npm run fmt` - Formats code with Prettier
- **Check All**: `npm run check-all` - Runs all checks (lint, type-check, tests, etc.)
- **Documentation**: `npm run doc` - Generates documentation using TypeDoc

### Testing

- Tests are type-level only using the custom `expectType` utility in `test/expect-type.mts`
- Test files mirror the source structure in the `test/` directory
- Tests verify type correctness using assertions like:

    ```typescript
    expectType<TypeEq<string, string>, true>('=');
    expectType<StrictOmit<{ a: 1; b: 2 }, 'a'>, { b: 2 }>('=');
    ```

## Architecture Overview

### Type-Level Only Library

This is a pure TypeScript type utility library with **no runtime code**. All files in `src/` are `.d.mts` declaration files that provide type-level operations.

### Module Organization

Types are organized into logical categories:

- **condition/**: Type predicates (IsNever, IsUnion, TypeEq, etc.)
- **constants/**: Common type constants (Primitive, FalsyValue, etc.)
- **record/**: Object type utilities (DeepReadonly, StrictOmit, etc.)
- **tuple-and-list/**: Array/tuple operations (List namespace, Tuple operations)
- **type-level-integer/**: Numeric type operations (UintRange, Increment, etc.)
- **others/**: Miscellaneous utilities (JsonValue, Mutable, etc.)
- **branded-types/**: Nominal typing utilities

### Key Patterns

1. **Triple-Slash References**: The main `index.d.mts` uses triple-slash directives to include all types globally
2. **Namespace Pattern**: Complex utilities like `List` use namespaces to group related operations
3. **Recursive Types**: Many operations use recursive conditional types for tuple/object manipulation
4. **Delegation**: List operations often delegate to Tuple operations for fixed-length arrays
5. **Readonly by Default**: Most returned types are readonly to promote immutability

### File Naming Convention

- All type definition files use `.d.mts` extension
- Test files use `.mts` extension
- Documentation is auto-generated in the `docs/` directory

### Type Testing Approach

The `expectType` utility provides a DSL for type assertions:

- `"="`: Exact type equality
- `"~="`: Mutual extension (A extends B and B extends A)
- `"<="`: A extends B
- `">="`: B extends A
- `"!="`, `"!<="`, `"!>="`: Negated versions
