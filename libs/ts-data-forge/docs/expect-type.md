[**Documentation**](README.md)

---

[Documentation](README.md) / expect-type

# expect-type

## Functions

### expectType()

> **expectType**\<`A`, `B`\>(`_relation`): `void`

Defined in: [src/expect-type.mts:198](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/expect-type.mts#L198)

Compile-time type assertion utility for TypeScript type testing.

This function performs static type relationship checking at compile-time and has no runtime effect.
It is primarily used in test files to verify that TypeScript's type inference and type relationships
work as expected. The function will cause TypeScript compilation errors if the specified type
relationship does not hold.

## Supported Type Relations

### Equality Relations

- **`"="` (strict equality)**: Asserts that types `A` and `B` are exactly the same type.
  Uses TypeScript's internal type equality checking.
- **`"!="` (strict inequality)**: Asserts that types `A` and `B` are not exactly the same type.

### Assignability Relations

- **`"~="` (mutual assignability)**: Asserts that `A` extends `B` AND `B` extends `A`.
  Types are structurally equivalent and mutually assignable.
- **`"<="` (subtype relation)**: Asserts that type `A` extends (is assignable to) type `B`.
  Type `A` is a subtype of `B`.
- **`">="` (supertype relation)**: Asserts that type `B` extends (is assignable to) type `A`.
  Type `A` is a supertype of `B`.

### Negative Assignability Relations

- **`"!<="` (not subtype)**: Asserts that type `A` does NOT extend type `B`.
- **`"!>="` (not supertype)**: Asserts that type `B` does NOT extend type `A`.

## Type Parameter Constraints

#### Type Parameters

##### A

`A`

The first type for comparison. Can be any TypeScript type including:

- Primitive types (string, number, boolean, etc.)
- Object types and interfaces
- Union and intersection types
- Generic types and type parameters
- Literal types and branded types
- Function types and return types

##### B

`B`

The second type for comparison. Same constraints as type `A`.

#### Parameters

##### \_relation

`TypeEq`\<`A`, `B`\> _extends_ `true` ? `"<="` \| `"="` \| `">="` \| `"~="` : `"!="` \| `TypeExtends`\<`A`, `B`\> _extends_ `true` ? `"<="` \| `TypeExtends`\<`B`, `A`\> _extends_ `true` ? `">="` \| `"~="` : `"!>="` : `"!<="` \| `TypeExtends`\<`B`, `A`\> _extends_ `true` ? `">="` : `"!>="`

A string literal representing the expected type relationship.
TypeScript's type system automatically infers and restricts the available operators
based on the actual relationship between types `A` and `B`. If an invalid relationship
is specified, TypeScript will show a compilation error.

## Usage Patterns

### Basic Type Testing

#### Returns

`void`

#### Examples

```typescript
import { expectType } from './expect-type.mjs';

// Primitive type equality
expectType<string, string>('='); // ✓ exact match
expectType<number, string>('!='); // ✓ different types
expectType<42, number>('<='); // ✓ literal extends primitive
expectType<number, 42>('>='); // ✓ primitive is supertype

// Type assertions will cause compilation errors for wrong relationships:
// expectType<string, number>("=");        // ❌ TypeScript error
// expectType<number, string>("<=");       // ❌ TypeScript error
```

### Array and Tuple Type Validation

```typescript
// Testing array utility function return types
const zeros = Arr.zeros(3);
expectType<typeof zeros, readonly [0, 0, 0]>('=');

const sequence = Arr.seq(5);
expectType<typeof sequence, readonly [0, 1, 2, 3, 4]>('=');

// Dynamic length arrays
const dynamicArray = Arr.zeros(someLength);
expectType<typeof dynamicArray, readonly 0[]>('=');
```

### Function Return Type Testing

```typescript
// Testing function return types
const createUser = () => ({ id: 1, name: 'John' });
expectType<ReturnType<typeof createUser>, { id: number; name: string }>('~=');

// Generic function type inference
const identity = <T>(x: T): T => x;
const result = identity('hello');
expectType<typeof result, string>('=');
```

### Union and Intersection Types

```typescript
// Union type relationships
expectType<string, string | number>('<='); // string extends union
expectType<string | number, string>('>='); // union contains string
expectType<string | number, number>('>='); // union contains number

// Intersection type relationships
type A = { a: number };
type B = { b: string };
expectType<A & B, A>('>='); // intersection extends component
expectType<A, A & B>('<='); // component extends intersection
```

### Branded Type Validation

```typescript
// Testing branded number types
expectType<PositiveInt, number>('<='); // branded type extends base
expectType<number, PositiveInt>('>='); // base type is supertype
expectType<PositiveInt, NegativeInt>('!='); // different branded types

// Type guard function validation
if (isPositiveInt(value)) {
    expectType<typeof value, PositiveInt>('<=');
}
```

### Optional and Result Type Testing

```typescript
// Optional type narrowing
const optional: Optional<number> = Optional.some(42);
if (Optional.isSome(optional)) {
    expectType<typeof optional, Optional.Some<number>>('<=');
}
if (Optional.isNone(optional)) {
    expectType<typeof optional, Optional.None>('<=');
}

// Result type validation
const result: Result<string, Error> = Result.ok('success');
expectType<typeof result, Result<string, Error>>('<=');
```

### Type Guard and Validation Testing

```typescript
// Testing type guard functions
if (isRecord(value)) {
    expectType<typeof value, UnknownRecord>('<=');
}

// Testing compile-time type predicates
const obj = { key: 'value' };
if (hasKey(obj, 'key')) {
    expectType<typeof obj.key, unknown>('<=');
}
```

## Common Testing Patterns

### Dual Testing Strategy

Combine `expectType` with runtime assertions for comprehensive testing:

```typescript
describe('Arr.zeros', () => {
    test('should create array of zeros with correct type', () => {
        const result = Arr.zeros(3);

        // Compile-time type assertion
        expectType<typeof result, readonly [0, 0, 0]>('=');

        // Runtime behavior assertion
        expect(result).toStrictEqual([0, 0, 0]);
    });
});
```

### Type Relationship Validation

Test complex type hierarchies and relationships:

```typescript
// Ensure proper type hierarchy
expectType<PositiveInt, Int>('<='); // positive is subset of int
expectType<Int, FiniteNumber>('<='); // int is subset of finite
expectType<FiniteNumber, number>('<='); // finite is subset of number

// Verify mutual exclusion
expectType<PositiveInt, NegativeInt>('!='); // different int types
expectType<PositiveInt, NegativeInt>('!<='); // neither extends the other
expectType<NegativeInt, PositiveInt>('!<=');
```

## Important Notes

- **Compile-time only**: This function has no runtime behavior and will be optimized away.
- **Type inference**: The available relation operators are automatically inferred by TypeScript
  based on the actual type relationship between `A` and `B`.
- **Error feedback**: Invalid type relationships will cause clear TypeScript compilation errors.
- **Test organization**: Typically used in `.test.mts` files alongside runtime assertions.
- **Performance**: Has zero runtime overhead as it's purely a compile-time construct.

#### Since

1.0.0
