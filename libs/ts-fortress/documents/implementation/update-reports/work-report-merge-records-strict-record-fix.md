# Work Report: Fix `mergeRecords` + Simplify Excess Property API (2026/03/13–16)

## Problem

### 1. `mergeRecords` with `strictRecord` was broken

When using `mergeRecords` with `strictRecord` types, validation always failed even for valid merged data:

```typescript
const merged = mergeRecords([
    strictRecord({ x: number(), y: number() }),
    strictRecord({ z: number(), w: number() }),
]);

merged.is({ x: 0, y: 1, z: 2, w: 3 }); // false (should be true)
```

**Root cause**: The previous implementation delegated validation to each individual record type independently. Each `strictRecord` rejected properties belonging to the other records as "excess".

### 2. Excess property option complexity

The original 3-mode system (`'allow' | 'strip' | 'error'`) had inherent type-safety issues:

- `'strip'` mode was not expressible with a single `Type<A>` parameter — `validate()` returned a stripped value while `is()` accepted the original with excess properties
- This led to `validationResult` / `fillResult` sub-options, creating combinatorial complexity
- The `Type<A>` interface fundamentally cannot represent different types for different functions

## Solution

### 1. Merged-Shape Validation via `record()` Delegation

`mergeRecords` now:

1. Merges shapes from all input records using `Obj.merge()`
2. Delegates to `record()` with the merged shape
3. Returns a proper `RecordType` (with `shape` and `excessProperty` properties)

This eliminates the per-record validation that caused the `strictRecord` bug.

### 2. Simplified `excessProperty` to Binary Choice

Replaced the 3-mode system with a clear binary:

```typescript
excessProperty: 'allow' | 'reject';
```

|                | `'allow'` (default)                  | `'reject'`                 |
| -------------- | ------------------------------------ | -------------------------- |
| `is()`         | Accepts excess → `true`              | Rejects excess → `false`   |
| `validate()`   | Ok — keeps excess (same reference)   | Err — reports excess keys  |
| `cast()`       | Returns original (with excess)       | Throws on excess           |
| `fill()`       | Always strips (shape-only)           | Always strips (shape-only) |
| `defaultValue` | Always exact (shape-only)            | Always exact (shape-only)  |
| Value type     | `RecordTypeValue<R> & UnknownRecord` | `RecordTypeValue<R>`       |

**Key design decision**: `fill` and `defaultValue` always produce shape-only values regardless of `excessProperty` setting, because they construct from the shape definition. The `RecordType` uses `Omit<Type<V>, 'fill' | 'defaultValue'>` to narrow their types to the exact `RecordTypeValue<R>`.

### 3. `strictRecord` Simplified

```typescript
// Before
strictRecord(shape, { excessPropertyFill: 'allow' | 'strip' });

// After
strictRecord(shape); // = record(shape, { excessProperty: 'reject' })
```

### 4. `mergeRecords` — "Strictest Wins" Default

When `excessProperty` is not explicitly provided, the strictest value from input records is used:

```typescript
mergeRecords([record({ x }), record({ y })]); // → 'allow' (both default to 'allow')
mergeRecords([strictRecord({ x }), record({ y })]); // → 'reject' (reject wins)
```

### 5. `cast` Returns Original Value

`cast()` now returns `a as T` (the original value) instead of `res.value` (the validated/potentially-stripped value). This makes `cast` a pure type assertion + validation check with no value transformation.

## Removed Types/Functions

| Removed                                                                           | Reason                                                     |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `ExcessPropertyBehavior` (`'allow' \| 'strip' \| 'error'`)                        | Replaced by `ExcessPropertyOption` (`'allow' \| 'reject'`) |
| `ExcessPropertyFillBehavior`                                                      | `fill` is now always strip-fixed                           |
| `ExcessPropertyConfig`, `ExcessPropertyConfigAllow`, `ExcessPropertyConfigReject` | Object-form config eliminated                              |
| `ExcessPropertyDefaultConfig`                                                     | Default is simply `'allow'`                                |
| `NormalizeExcessPropertyOption`                                                   | No normalization needed                                    |
| `normalizeExcessProperty()`                                                       | No runtime normalization needed                            |

## Breaking Changes

| Change                                                         | Migration                                                                                                   |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Default `excessProperty` is `'allow'` (was `'strip'`)          | `validate()` now keeps excess properties instead of stripping. Use `'reject'` if excess should be rejected. |
| `validate()` returns same reference for valid input (no strip) | Code relying on stripped results should process validate's Ok value manually.                               |
| `TypeOf<RecordType<R>>` includes `& UnknownRecord`             | Default record types now have wider value type. Use `'reject'` for exact types.                             |
| `strictRecord` no longer accepts `fillResult` option           | `fill` always strips; no option needed.                                                                     |
| `cast()` returns original value, not validate result           | `cast()` no longer strips excess.                                                                           |
| Validation error format from `mergeRecords`                    | Direct property-level errors only (no intersection wrapper).                                                |

## Behavior Changes

| Scenario                                                                | Before              | After                      |
| ----------------------------------------------------------------------- | ------------------- | -------------------------- |
| `mergeRecords([strictRecord({x}), strictRecord({y})])` with `{x, y}`    | Rejected (bug)      | Accepted                   |
| `mergeRecords([strictRecord({x}), strictRecord({y})])` with `{x, y, z}` | Rejected            | Rejected (excess `z`)      |
| `mergeRecords([record({x}), record({y})])` with `{x, y, z}`             | Accepted (stripped) | Accepted (kept as-is)      |
| `record({x}).validate({x: 0, extra: 1})`                                | Ok — stripped       | Ok — kept as-is (same ref) |
| `record({x}).fill({x: 0, extra: 1})`                                    | Depended on option  | Always strips              |
| `strictRecord({x}).validate({x: 0, extra: 1})`                          | Err                 | Err (same)                 |

## Files Changed

| File                                                             | Change                                                                            |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `src/type.mts`                                                   | Simplified `ExcessPropertyOption`, `RecordType` with `Omit` for fill/defaultValue |
| `src/record/record.mts`                                          | Simplified to binary allow/reject, removed normalizeExcessProperty                |
| `src/record/merge-records.mts`                                   | Delegates to `record()`, uses `Obj.merge`, simplified deriveStrictest             |
| `src/record/pick.mts`, `omit.mts`, `partial.mts`, `required.mts` | Updated EP default to `'allow'`                                                   |
| `src/utils/create-cast-fn.mts`                                   | `return a as T` instead of `return res.value`                                     |
| All test files (16)                                              | Updated for new API and behavior                                                  |
| `samples/` (2 files)                                             | Updated option names                                                              |

## Test Coverage

- **86 test files, 1294 tests** all passing
- **TypeScript type checking** passes with no errors
- Tests cover:
    - `mergeRecords` with `strictRecord` — is/validate/fill/cast
    - `mergeRecords` with mixed strict/permissive — "strictest wins" derivation
    - `excessProperty: 'allow'` — validate keeps excess, same reference
    - `excessProperty: 'reject'` — validate rejects excess, error messages
    - `fill` always strips regardless of excessProperty setting
    - Composition (pick/omit/partial/required) inherits excessProperty from base
    - Type-level assertions: `TypeOf` includes `UnknownRecord` for `'allow'`, exact for `'reject'`
