[**Documentation**](../README.md)

---

[Documentation](../README.md) / condition/is-union

# condition/is-union

## Type Aliases

### IsUnion\<U\>

> **IsUnion**\<`U`\> = `TSTypeForgeInternals.IsUnionImpl`\<`U`, `U`\>

Defined in: [condition/is-union.d.mts:26](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/condition/is-union.d.mts#L26)

Checks if a given type `U` is a union type (contains more than one distinct type member).

It works by distributing over the potential union members of `U` and comparing
the original type `U` with each distributed member `M`. If `U` is a union,
there will be at least one `M` for which `TypeEq<U, M>` is `false`, causing the
result for that branch to be `true`. The final result becomes `true` if any branch
evaluates to `true`. If `U` is not a union, `M` will be the same as `U`,
`TypeEq<U, M>` will be `true`, and the result will be `false`.

Note: `never`, `any`, and `unknown` are not considered unions by this type.

#### Type Parameters

##### U

`U`

The type to check.

#### Returns

`true` if `U` is a union type, `false` otherwise.

#### Example

```ts
type T1 = IsUnion<string | number>; // true
type T2 = IsUnion<string>; // false
type T3 = IsUnion<string | string>; // false (simplifies to string)
type T4 = IsUnion<never>; // false
type T5 = IsUnion<any>; // false
type T6 = IsUnion<unknown>; // false
type T7 = IsUnion<true | false>; // true (boolean)
type T8 = IsUnion<boolean>; // true (equivalent to true | false)
```

## References

### TSTypeForgeInternals

Re-exports [TSTypeForgeInternals](../branded-types/brand/namespaces/TSTypeForgeInternals/README.md)
