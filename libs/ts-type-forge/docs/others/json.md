[**ts-type-forge**](../README.md)

***

[ts-type-forge](../README.md) / others/json

# others/json

## Type Aliases

### JsonPrimitive

> **JsonPrimitive** = `boolean` \| `number` \| `string` \| `null`

Defined in: [src/others/json.d.mts:15](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/json.d.mts#L15)

Represents the primitive types allowed in JSON according to RFC 7159.
JSON primitives are: `boolean`, `number`, `string`, and `null`.
Note that `undefined` is not a valid JSON primitive.

#### Example

```ts
const jsonString: JsonPrimitive = "hello";     // ✓ valid
const jsonNumber: JsonPrimitive = 42;          // ✓ valid
const jsonBoolean: JsonPrimitive = true;       // ✓ valid
const jsonNull: JsonPrimitive = null;          // ✓ valid
// const invalid: JsonPrimitive = undefined;   // ✗ error
```

***

### MutableJsonValue

> **MutableJsonValue** = [`JsonPrimitive`](#jsonprimitive) \| [`MutableJsonValue`](#mutablejsonvalue)[] \| \{\[`k`: `string`\]: [`MutableJsonValue`](#mutablejsonvalue); \}

Defined in: [src/others/json.d.mts:44](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/json.d.mts#L44)

Represents any valid JSON value that can be modified after creation.
This includes primitives, mutable arrays of JSON values, or mutable objects
where keys are strings and values are JSON values.

Use this type when you need to build, modify, or manipulate JSON structures
programmatically, such as constructing API payloads or transforming data.

#### Example

```ts
const apiPayload: MutableJsonValue = {
  user: {
    name: "John Doe",
    age: 30,
    preferences: ["dark-mode", "notifications"]
  }
};

// Can modify the structure
if (typeof apiPayload === 'object' && apiPayload !== null && 'user' in apiPayload) {
  const user = apiPayload.user as MutableJsonValue;
  if (typeof user === 'object' && user !== null && 'age' in user) {
    (user as any).age = 31; // Update age
  }
}
```

***

### JsonValue

> **JsonValue** = [`JsonPrimitive`](#jsonprimitive) \| `Readonly`\<\{\[`k`: `string`\]: [`JsonValue`](#jsonvalue); \}\> \| readonly [`JsonValue`](#jsonvalue)[]

Defined in: [src/others/json.d.mts:81](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/json.d.mts#L81)

Represents any valid JSON value in its immutable form.
This includes primitives, readonly arrays of JSON values, or readonly objects
where keys are strings and values are JSON values.

Use this type for representing parsed JSON data that should not be modified,
such as configuration files, API responses that should remain unchanged,
or when enforcing immutability in your application.

#### Example

```ts
// API response that should remain immutable
const apiResponse: JsonValue = {
  data: {
    users: [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    ]
  },
  meta: { total: 2, page: 1 }
};

// Type-safe JSON parsing
const parseConfig = (jsonString: string): JsonValue => {
  return JSON.parse(jsonString) as JsonValue;
};

// apiResponse.data.users.push({...}); // ✗ Error: readonly array
```

***

### JsonObject

> **JsonObject** = [`ReadonlyRecord`](../record/std.md#readonlyrecord)\<`string`, [`JsonValue`](#jsonvalue)\>

Defined in: [src/others/json.d.mts:107](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/json.d.mts#L107)

Represents an immutable JSON object with string keys and `JsonValue` values.
The object itself and all nested structures are readonly, ensuring immutability
throughout the entire object tree.

#### Example

```ts
const config: JsonObject = {
  database: {
    host: "localhost",
    port: 5432,
    ssl: true
  },
  features: ["auth", "logging"]
};

// config.database.port = 3306; // ✗ Error: readonly property
```

***

### MutableJsonObject

> **MutableJsonObject** = [`MutableRecord`](../record/std.md#mutablerecord)\<`string`, [`MutableJsonValue`](#mutablejsonvalue)\>

Defined in: [src/others/json.d.mts:125](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/others/json.d.mts#L125)

Represents a mutable JSON object with string keys and `MutableJsonValue` values.
All properties can be modified after creation, making it suitable for building
or transforming JSON structures.

#### Example

```ts
const builder: MutableJsonObject = {};
builder.timestamp = Date.now();
builder.data = { message: "Hello" };
builder.tags = ["info", "user-action"];

// All modifications are allowed
builder.data = { message: "Updated" }; // ✓ valid
```
