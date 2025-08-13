[**ts-fortress**](README.md)

---

[ts-fortress](README.md) / type

# type

## Type Aliases

### OptionalType\<A\>

> **OptionalType**\<`A`\> = `MergeIntersection`\<[`Type`](#type)\<`A`\> & `Readonly`\<\{ `optional`: `true`; \}\>\>

Defined in: [type.mts:29](https://github.com/noshiro-pf/ts-fortress/blob/main/src/type.mts#L29)

#### Type Parameters

##### A

`A`

---

### Type\<A\>

> **Type**\<`A`\> = `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is A`; `cast`: (`a`) => `A`; `defaultValue`: `A`; `fill`: (`a`) => `A`; `is`: (`a`) => `a is A`; `optional?`: `true`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`A`, readonly [`ValidationError`](validation-error.md#validationerror)[]\>; \}\>

Defined in: [type.mts:14](https://github.com/noshiro-pf/ts-fortress/blob/main/src/type.mts#L14)

- `typeName` : Name for this type
- `is` : Type guard function
- `assertIs` : Type assertion function
- `cast` : Cast function
- `fill` : Default value filling function
- `validate` : A base function to be used in `is` and `assertIs`. `validate`
  returns Result.Ok if the value is of Type A, otherwise returns Result.Err
  with structured validation error information.

#### Type Parameters

##### A

`A`

---

### TypeOf\<A\>

> **TypeOf**\<`A`\> = `A`\[`"defaultValue"`\]

Defined in: [type.mts:27](https://github.com/noshiro-pf/ts-fortress/blob/main/src/type.mts#L27)

#### Type Parameters

##### A

`A` _extends_ [`Type`](#type)\<`unknown`\>
