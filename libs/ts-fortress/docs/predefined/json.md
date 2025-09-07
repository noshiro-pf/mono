[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / predefined/json

# predefined/json

## Variables

### JsonObject

> `const` **JsonObject**: `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is RecordResultType<Readonly<{ assertIs: (a: unknown) => asserts a is string; cast: (a: unknown) => string; defaultValue: string; fill: (a: unknown) => string; is: (a: unknown) => a is string; typeName: string; validate: (a: unknown) => Result<string, readonly Readonly<{ actualValue: ...; expectedType: ...; path: ...; typeName: ... }>[]> }>, Readonly<{ assertIs: (a: unknown) => asserts a is JsonValue; cast: (a: unknown) => JsonValue; defaultValue: JsonValue; fill: (a: unknown) => JsonValue; is: (a: unknown) => a is JsonValue; typeName: string; validate: (a: unknown) => Result<JsonValue, readonly Readonly<{ actualValue: ...; expectedType: ...; path: ...; typeName: ... }>[]> }>>`; `cast`: (`a`) => `A`; `defaultValue`: `A`; `fill`: (`a`) => `A`; `is`: (`a`) => `a is RecordResultType<Readonly<{ assertIs: (a: unknown) => asserts a is string; cast: (a: unknown) => string; defaultValue: string; fill: (a: unknown) => string; is: (a: unknown) => a is string; typeName: string; validate: (a: unknown) => Result<string, readonly Readonly<{ actualValue: ...; expectedType: ...; path: ...; typeName: ... }>[]> }>, Readonly<{ assertIs: (a: unknown) => asserts a is JsonValue; cast: (a: unknown) => JsonValue; defaultValue: JsonValue; fill: (a: unknown) => JsonValue; is: (a: unknown) => a is JsonValue; typeName: string; validate: (a: unknown) => Result<JsonValue, readonly Readonly<{ actualValue: ...; expectedType: ...; path: ...; typeName: ... }>[]> }>>`; `typeName`: `string`; `validate`: (`a`) => [`Result`](../entry-point/README.md#result)\<`RecordResultType`\<`Readonly`\<\{ `assertIs`: (`a`) => `asserts a is string`; `cast`: (`a`) => `string`; `defaultValue`: `string`; `fill`: (`a`) => `string`; `is`: (`a`) => `a is string`; `typeName`: `string`; `validate`: (`a`) => [`Result`](../entry-point/README.md#result)\<`string`, readonly `Readonly`\<...\>[]\>; \}\>, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is JsonValue`; `cast`: (`a`) => `JsonValue`; `defaultValue`: `JsonValue`; `fill`: (`a`) => `JsonValue`; `is`: (`a`) => `a is JsonValue`; `typeName`: `string`; `validate`: (`a`) => [`Result`](../entry-point/README.md#result)\<`JsonValue`, readonly `Readonly`\<...\>[]\>; \}\>\>, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>

Defined in: [src/predefined/json.mts:33](https://github.com/noshiro-pf/ts-fortress/blob/main/src/predefined/json.mts#L33)

---

### JsonPrimitive

> `const` **JsonPrimitive**: `Readonly`\<\{ `assertIs`: (`a`) => asserts a is null \| string \| number \| boolean; `cast`: (`a`) => `null` \| `string` \| `number` \| `boolean`; `defaultValue`: `null` \| `string` \| `number` \| `boolean`; `fill`: (`a`) => `null` \| `string` \| `number` \| `boolean`; `is`: (`a`) => a is null \| string \| number \| boolean; `typeName`: `string`; `validate`: (`a`) => [`Result`](../entry-point/README.md#result)\<`null` \| `string` \| `number` \| `boolean`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>

Defined in: [src/predefined/json.mts:8](https://github.com/noshiro-pf/ts-fortress/blob/main/src/predefined/json.mts#L8)

---

### JsonValue

> `const` **JsonValue**: [`Type`](../type/README.md#type)\<`JsonValue`\>

Defined in: [src/predefined/json.mts:19](https://github.com/noshiro-pf/ts-fortress/blob/main/src/predefined/json.mts#L19)
