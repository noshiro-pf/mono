[**typescript-template**](README.md)

---

[typescript-template](README.md) / expect-type

# expect-type

## Functions

### expectType()

> **expectType**\<`A`, `B`\>(`_relation`): `void`

Defined in: [expect-type.mts:47](https://github.com/noshiro-pf/typescript-template/blob/main/src/expect-type.mts#L47)

Compile-time type assertion utility.
Checks the relationship between type `A` and type `B` based on the `_relation` parameter.
This function has no runtime effect and is used for static type checking.

Supported relations:

- `expectType<A, B>("=")`: Asserts that type `A` is strictly equal to type `B`.
- `expectType<A, B>("~=")`: Asserts that type `A` extends type `B`, and type `B` extends type `A` (i.e., they are mutually assignable).
- `expectType<A, B>("<=")`: Asserts that type `A` extends type `B` (i.e., `A` is a subtype of `B`).
- `expectType<A, B>(">=")`: Asserts that type `B` extends type `A` (i.e., `B` is a subtype of `A`).
- `expectType<A, B>("!<=")`: Asserts that type `A` does not extend type `B`.
- `expectType<A, B>("!>=")`: Asserts that type `B` does not extend type `A`.
- `expectType<A, B>("!=")`: Asserts that type `A` is not strictly equal to type `B`.

#### Type Parameters

##### A

`A`

The first type for comparison.

##### B

`B`

The second type for comparison.

#### Parameters

##### \_relation

`TypeEq`\<`A`, `B`\> _extends_ `true` ? `"<="` \| `"="` \| `">="` \| `"~="` : `"!="` \| `TypeExtends`\<`A`, `B`\> _extends_ `true` ? `"<="` \| `TypeExtends`\<`B`, `A`\> _extends_ `true` ? `">="` \| `"~="` : `"!>="` : `"!<="` \| `TypeExtends`\<`B`, `A`\> _extends_ `true` ? `">="` : `"!>="`

A string literal representing the expected type relationship.
TypeScript infers the valid literals based on `A` and `B`.
Must be one of: `"="`, `"~="`, `"<="`, `">="`, `"!<="`, `"!>="`, `"!="`.

#### Returns

`void`

#### Example

```typescript
// Type equality
expectType<string, string>('='); // ✓ passes
expectType<number, string>('!='); // ✓ passes

// Subtype relationships
expectType<'hello', string>('<='); // ✓ literal extends string
expectType<string, 'hello'>('>='); // ✓ string is supertype of literal

// Array type checking in tests
const result = [1, 2, 3] as const;
expectType<typeof result, readonly [1, 2, 3]>('='); // ✓ exact tuple match

// Function return type validation
const fn = () => ({ a: 1, b: 2 });
expectType<ReturnType<typeof fn>, { a: number; b: number }>('~='); // ✓ structurally equivalent

// Union and intersection types
expectType<string | number, string>('>='); // ✓ union contains string
expectType<string, string | number>('<='); // ✓ string extends union

// Negative assertions
expectType<string, number>('!='); // ✓ different types
expectType<string, number>('!<='); // ✓ string doesn't extend number
```
