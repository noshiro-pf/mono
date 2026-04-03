# DeepPick / DeepOmit Design Report

## Overview

`DeepPick<T, Path>` and `DeepOmit<T, Path>` are type utilities that operate on nested object types along key paths specified as tuples.

```ts
type Picked = DeepPick<{ a: { b: { c: number; d: string } } }, ['a', 'b', 'c']>;
// { a: { b: { c: number } } }

type Omitted = DeepOmit<
    { a: { b: { c: number; d: string } } },
    ['a', 'b', 'c']
>;
// { a: { b: { d: string } } }
```

Both support union of paths (`['a', 'b'] | ['a', 'c']`) to operate on multiple nested properties at once.

## Implementation Strategy

### Core Mechanism

Both types use **homomorphic mapped types** with `as` clause key remapping:

- **DeepPick**: keeps only keys that appear as the head of some path.
- **DeepOmit**: removes keys that appear as the sole element of a length-1 path (leaf removal).

Value computation is delegated to `DeepPickValue` / `DeepOmitValue` helpers that recursively apply the operation by extracting tails for each key.

### Shared Internal Helpers

| Helper                      | Role                                                       |
| --------------------------- | ---------------------------------------------------------- |
| `DeepPickOmitHead<Path>`    | Extracts the first element from each path in a union       |
| `DeepPickOmitTail<Path, K>` | Extracts remaining elements of paths starting with key `K` |
| `DeepOmitLeafKeys<Path>`    | Extracts keys from length-1 paths (keys to be removed)     |

## Design Decisions and Their Rationale

### 1. Prefix Path Handling (`[] extends Tail`)

**Problem**: When paths form a prefix relationship (e.g., `['a'] | ['a', 'b']`), the tail union for key `'a'` becomes `[] | ['b']`. The shorter path should take precedence.

**Solution**: Use `[] extends Tail` (not `[Tail] extends [readonly []]`) to detect whether the empty tuple is _included_ in a union of tails. `[] extends ([] | ['b'])` evaluates to `true`, correctly returning `T` (the full subtree).

**Why not `[Tail] extends [readonly []]`**: This only matches when `Tail` is _exactly_ `[]`. For `[] | ['b']`, the check fails and incorrectly recurses, dropping properties.

### 2. Preventing Conditional Type Distribution (`[Tail] extends [never]`, `[NonNullable<T>] extends [...]`)

**Problem**: Conditional types distribute over unions. When `Tail` is a union (from union paths) or `T` includes `undefined` (from optional properties), unguarded conditionals produce incorrect results.

Examples of distribution bugs:

- `TTail extends readonly []` with `TTail = ['b'] | ['c']` distributes into `DeepOmit<T, ['b']> | DeepOmit<T, ['c']>` instead of `DeepOmit<T, ['b'] | ['c']>`.
- `T extends Record<string, any>` with `T = {b: number} | undefined` (from `a?`) distributes, causing `NonNullable<unknown>` to appear in the union and broaden the type.

**Solution**:

- Wrap checks in `[X] extends [Y]` to prevent distribution: `[Tail] extends [never]`, `[NonNullable<T>] extends [Record<string, any> | readonly unknown[]]`.
- Use `NonNullable<T>` before the record check to strip `undefined` added by optional property access, then pass `NonNullable<T>` to the recursive call.

### 3. Primitive Type Guard and RelaxedPick Consistency

**Problem**: When a path continues through a primitive value (e.g., `DeepPick<{ a: number }, ['a', 'b']>`), there is no record to recurse into. Without a guard, the mapped type iterates over `keyof number` (method names like `toString`, `toFixed`, ...) and the `as` clause may not fully resolve due to TypeScript's lazy evaluation of generic mapped types over primitive key types.

**Design choice**: The guard checks `[NonNullable<T>] extends [Record<string, any> | readonly unknown[]]` before recursing:

| Type         | DeepPick behavior                             | DeepOmit behavior                             | Rationale                   |
| ------------ | --------------------------------------------- | --------------------------------------------- | --------------------------- |
| Record/Array | Recurse with `DeepPick<NonNullable<T>, Tail>` | Recurse with `DeepOmit<NonNullable<T>, Tail>` | Normal structural recursion |
| Primitive    | Return `NonNullable<unknown>` (= `{}`)        | Return `T` unchanged                          | See below                   |

**DeepPick** returns `NonNullable<unknown>` (equivalent to `{}`) for primitives, consistent with `RelaxedPick` where referencing a non-existent key produces an empty object type:

```ts
RelaxedPick<{ b: number }, 'a'>; // {}
DeepPick<{ a: number }, ['a', 'b']>; // { a: {} }  -- 'b' doesn't exist on number
DeepPick<{ a: { b: number } }, ['a', 'x']>; // { a: {} }  -- 'x' doesn't exist on record
```

**DeepOmit** returns `T` unchanged for primitives, consistent with the principle that omitting a non-existent key is a no-op:

```ts
DeepOmit<{ a: number; b: string }, ['a', 'x']>; // { a: number; b: string }
DeepOmit<{ a: { b: number } }, ['a', 'x']>; // { a: { b: number } }
```

### 4. TypeScript TypeEq Compatibility

The implementation navigates several TypeScript compiler behaviors that affect `TypeEq` (exact structural equality checking via `(<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2)`):

| Pattern                                                        | TypeEq compatible? | Notes                                                               |
| -------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------- |
| `{[K in keyof T]: expr}` (homomorphic mapped type)             | Yes                | Preserves `readonly` / `?` modifiers                                |
| `{[K in keyof T as filter]: expr}` with concrete types         | Yes                |                                                                     |
| `{[K in keyof T as filter]: expr}` inside conditional type     | No                 | Conditional wrapping can break modifier preservation                |
| `Omit<MappedType, Keys>` / `Pick<MappedType, Keys>`            | Yes                | `Pick`/`Omit` preserve modifiers from the source type               |
| Recursive type in mapped type value (single path)              | Yes                | TypeScript resolves the recursion for concrete types                |
| Recursive type in mapped type value (union path, distributing) | No                 | Distribution produces a union instead of the intended merged result |

## Test Coverage

The test suite covers the following categories:

- Basic pick/omit at depths 1, 2, 3
- Multiple paths via union of paths (same depth, different depths)
- Prefix paths (`['a'] | ['a', 'b']`, `['a', 'b'] | ['a', 'b', 'c']`, etc.)
- Modifier preservation (`optional`, `readonly`)
- Union input types (distribution over members)
- Intersection input types (flattened shape, overlapping keys)
- Non-existent keys (top-level, nested, through primitives)
- RelaxedPick consistency reference

## Files

- `src/record/deep-pick-omit.d.mts` -- Type definitions
- `test/record/deep-pick-omit.mts` -- Type-level tests
- `src/index.d.mts` -- Triple-slash reference (entry point)
