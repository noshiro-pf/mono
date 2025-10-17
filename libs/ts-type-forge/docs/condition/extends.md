[**ts-type-forge**](../README.md)

***

[ts-type-forge](../README.md) / condition/extends

# condition/extends

## Type Aliases

### TypeExtends

> **TypeExtends**\<`A`, `B`\> = \[`A`\] *extends* \[`B`\] ? `true` : `false`

Defined in: [src/condition/extends.d.mts:45](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/condition/extends.d.mts#L45)

Checks if type `A` is assignable to (extends) type `B`.

This utility provides a reusable way to perform TypeScript's `extends` check
and return the result as a boolean literal type. It uses the tuple wrapping
technique `[A] extends [B]` to prevent union distribution, ensuring that
union types are treated as single units rather than being distributed.

This is the type-level equivalent of asking "Can type A be used wherever type B is expected?"

#### Type Parameters

##### A

`A`

The type to check for assignability.

##### B

`B`

The target type to check against.

#### Returns

`true` if `A` is assignable to `B`, `false` otherwise.

#### Example

```ts
// Basic assignability checks
type T1 = TypeExtends<string, string | number>; // true (string is part of union)
type T2 = TypeExtends<string | number, string>; // false (union is broader than string)
type T3 = TypeExtends<'hello', string>; // true (literal extends primitive)
type T4 = TypeExtends<string, 'hello'>; // false (primitive doesn't extend literal)

// Object assignability
type T5 = TypeExtends<{ a: number }, object>; // true (specific object extends general object)
type T6 = TypeExtends<{ a: number; b: string }, { a: number }>; // true (extra properties allowed)

// Special types
type T7 = TypeExtends<never, string>; // true (never is assignable to anything)
type T8 = TypeExtends<any, string>; // true (any is assignable to anything)
type T9 = TypeExtends<string, any>; // true (anything is assignable to any)
type T10 = TypeExtends<string, unknown>; // true (anything is assignable to unknown)
type T11 = TypeExtends<unknown, string>; // false (unknown is not assignable to specific types)

// Practical usage in conditional types
type IsOptional<T, K extends keyof T> = TypeExtends<T[K], undefined>;
type IsFunction<T> = TypeExtends<T, (...args: any[]) => any>;
type IsArray<T> = TypeExtends<T, readonly unknown[]>;

// Type compatibility checking
type CanAssign<From, To> = TypeExtends<From, To>;
type StringToNumber = CanAssign<string, number>; // false
type NumberToStringUnion = CanAssign<number, string | number>; // true
```
