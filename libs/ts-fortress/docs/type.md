[**ts-fortress**](README.md)

---

[ts-fortress](README.md) / type

# type

## Type Aliases

### OptionalType\<A\>

> **OptionalType**\<`A`\> = `MergeIntersection`\<[`Type`](#type)\<`A`\> & `Readonly`\<\{ `optional`: `true`; \}\>\>

Defined in: [type.mts:28](https://github.com/noshiro-pf/ts-fortress/blob/main/src/type.mts#L28)

#### Type Parameters

##### A

`A`

---

### Type\<A\>

> **Type**\<`A`\> = `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is A`; `cast`: (`a`) => `A`; `defaultValue`: `A`; `fill`: (`a`) => `A`; `is`: (`a`) => `a is A`; `optional?`: `true`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`A`, readonly `string`[]\>; \}\>

Defined in: [type.mts:13](https://github.com/noshiro-pf/ts-fortress/blob/main/src/type.mts#L13)

- `typeName` : Name for this type
- `is` : Type guard function
- `assertIs` : Type assertion function
- `cast` : Cast function
- `fill` : Default value filling function
- `validate` : A base function to be used in `is` and `assertIs`. `validate`
  returns Result.Ok if the value is of Type A, otherwise returns Result.Err
  with error message stack as the value.

#### Type Parameters

##### A

`A`

---

### TypeOf\<A\>

> **TypeOf**\<`A`\> = `A`\[`"defaultValue"`\]

Defined in: [type.mts:26](https://github.com/noshiro-pf/ts-fortress/blob/main/src/type.mts#L26)

#### Type Parameters

##### A

`A` _extends_ [`Type`](#type)\<`unknown`\>
