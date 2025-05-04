[**Documentation**](../README.md)

---

[Documentation](../README.md) / others/json

# others/json

## Type Aliases

### JsonObject

> **JsonObject** = `Readonly`\<`Record`\<`string`, [`JsonValue`](#jsonvalue)\>\>

Defined in: [others/json.d.mts:35](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/json.d.mts#L35)

Represents an immutable JSON object, which is a record with string keys and `JsonValue` values.
Ensures the object itself is readonly.

---

### JsonPrimitive

> **JsonPrimitive** = `boolean` \| `number` \| `string` \| `null`

Defined in: [others/json.d.mts:4](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/json.d.mts#L4)

Represents the primitive types allowed in JSON: boolean, number, string, or null.

---

### JsonValue

> **JsonValue** = [`JsonPrimitive`](#jsonprimitive) \| `Readonly`\<\{[`k`: `string`]: [`JsonValue`](#jsonvalue); \}\> \| readonly [`JsonValue`](#jsonvalue)[]

Defined in: [others/json.d.mts:24](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/json.d.mts#L24)

Represents any valid, immutable JSON value.
This includes primitives, readonly arrays of JSON values,
or readonly objects where keys are strings and values are JSON values.
Use this type for representing parsed or received JSON data that should not be modified.

---

### MutableJsonObject

> **MutableJsonObject** = [`MutableRecord`](../record/std.md#mutablerecord)\<`string`, [`MutableJsonValue`](#mutablejsonvalue)\>

Defined in: [others/json.d.mts:41](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/json.d.mts#L41)

Represents a mutable JSON object, which is a record with string keys and `MutableJsonValue` values.
Allows modification of the object's properties.

---

### MutableJsonValue

> **MutableJsonValue** = [`JsonPrimitive`](#jsonprimitive) \| [`MutableJsonValue`](#mutablejsonvalue)[] \| \{[`k`: `string`]: [`MutableJsonValue`](#mutablejsonvalue); \}

Defined in: [others/json.d.mts:11](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/json.d.mts#L11)

Represents any valid JSON value, including primitives, mutable arrays of JSON values,
or mutable objects where keys are strings and values are JSON values.
Use this type when you need to build or modify JSON structures.
