[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [json/json](../README.md) / Json

# Json

A collection of type-safe JSON utility functions that provide safe parsing,
stringification, and manipulation of JSON data. All functions return `Result`
types to handle errors without throwing exceptions.

## Example

```typescript
import { Json, Result } from 'ts-data-forge';

// Parse JSON safely
const parseResult = Json.parse('{"name": "Alice", "age": 30}');
if (Result.isOk(parseResult)) {
    console.log(parseResult.value); // { name: 'Alice', age: 30 }
}

// Stringify with error handling
const stringifyResult = Json.stringify({ name: 'Bob', age: 25 });
if (Result.isOk(stringifyResult)) {
    console.log(stringifyResult.value); // '{"name":"Bob","age":25}'
}
```

## Functions

### parse()

> **parse**(`text`, `reviver?`): [`Result`](../../../functional/result/README.md#result)\<`JsonValue`, `string`\>

Defined in: [src/json/json.mts:62](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/json/json.mts#L62)

Safely converts a JSON string into a JavaScript value without throwing exceptions.

This function provides type-safe JSON parsing by wrapping the native `JSON.parse`
in a `Result` type, allowing you to handle parsing errors gracefully without
try-catch blocks.

#### Parameters

##### text

`string`

A valid JSON string to parse. Can contain any valid JSON data type:
primitives (string, number, boolean, null), arrays, or objects.

##### reviver?

(`this`, `key`, `value`) => `unknown`

Optional function that transforms parsed values. Called for each
key-value pair in the JSON. The function receives the key name and parsed value,
and should return the transformed value. For nested objects, inner objects are
processed before outer objects.

#### Returns

[`Result`](../../../functional/result/README.md#result)\<`JsonValue`, `string`\>

A `Result<JsonValue, string>` containing:

- On success: `Result.ok(parsedValue)` where `parsedValue` is the parsed JSON
- On failure: `Result.err(errorMessage)` where `errorMessage` describes the parsing error

#### Examples

```typescript
const result = Json.parse('{"name": "John", "age": 30}');
if (Result.isOk(result)) {
    console.log(result.value.name); // 'John'
}
```

```typescript
const invalid = Json.parse('invalid json');
if (Result.isErr(invalid)) {
    console.log('Parse failed:', invalid.value);
}
```

---

### stringify()

> **stringify**(`value`, `replacer?`, `space?`): [`Result`](../../../functional/result/README.md#result)\<`string`, `string`\>

Defined in: [src/json/json.mts:120](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/json/json.mts#L120)

Safely converts a JavaScript value to a JSON string without throwing exceptions.

This function provides type-safe JSON stringification by wrapping the native
`JSON.stringify` in a `Result` type, allowing you to handle serialization errors
gracefully (such as circular references or BigInt values).

#### Parameters

##### value

`unknown`

The JavaScript value to serialize. Can be any value that JSON.stringify
accepts: primitives, objects, arrays. Non-serializable values (functions, undefined,
symbols) will be omitted or converted to null according to JSON.stringify behavior.

##### replacer?

(`this`, `key`, `val`) => `unknown`

Optional function that transforms values during serialization.
Called for each key-value pair. Should return the value to be serialized, or
undefined to omit the property from the result.

##### space?

Optional parameter for formatting the output JSON:

- Number (1-10): Number of spaces to indent each level
- String: String to use for indentation (first 10 characters)
- undefined/null: No formatting (compact output)

`string` | `1` | `2` | `3` | `4` | `5` | `6` | `7` | `8` | `9` | `10`

#### Returns

[`Result`](../../../functional/result/README.md#result)\<`string`, `string`\>

A `Result<string, string>` containing:

- On success: `Result.ok(jsonString)` where `jsonString` is the serialized JSON
- On failure: `Result.err(errorMessage)` where `errorMessage` describes the error

#### Examples

```typescript
const obj = { name: 'John', age: 30 };
const result = Json.stringify(obj);
if (Result.isOk(result)) {
    console.log(result.value); // '{"name":"John","age":30}'
}
```

```typescript
const circular: any = { name: 'test' };
circular.self = circular;
const error = Json.stringify(circular);
if (Result.isErr(error)) {
    console.log('Stringify failed:', error.value);
}
```

---

### stringifySelected()

> **stringifySelected**(`value`, `propertiesToBeSelected?`, `space?`): [`Result`](../../../functional/result/README.md#result)\<`string`, `string`\>

Defined in: [src/json/json.mts:169](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/json/json.mts#L169)

Safely converts a JavaScript value to a JSON string, including only the specified properties.

This function provides selective serialization by allowing you to specify exactly which
object properties should be included in the resulting JSON. It's useful for creating
filtered or minimal representations of objects, such as for API responses or logging.

#### Parameters

##### value

`unknown`

The JavaScript value to serialize. While any value is accepted,
the property filtering only applies to objects and nested objects.

##### propertiesToBeSelected?

readonly (`string` \| `number`)[]

Optional array of property names (strings) and array
indices (numbers) to include in the serialization. If provided, only these properties
will appear in the output JSON. If undefined, all properties are included.

##### space?

Optional formatting parameter:

- Number (1-10): Number of spaces to indent each level
- String: String to use for indentation (first 10 characters)
- undefined/null: No formatting (compact output)

`string` | `1` | `2` | `3` | `4` | `5` | `6` | `7` | `8` | `9` | `10`

#### Returns

[`Result`](../../../functional/result/README.md#result)\<`string`, `string`\>

A `Result<string, string>` containing:

- On success: `Result.ok(jsonString)` with only selected properties
- On failure: `Result.err(errorMessage)` describing the serialization error

#### Example

```typescript
const user = {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    password: 'secret123',
};

const publicFields = Json.stringifySelected(user, ['id', 'name', 'email']);
if (Result.isOk(publicFields)) {
    console.log(publicFields.value);
    // '{"id":1,"name":"Alice","email":"alice@example.com"}'
}
```

---

### stringifySortedKey()

> **stringifySortedKey**(`value`, `space?`): [`Result`](../../../functional/result/README.md#result)\<`string`, `string`\>

Defined in: [src/json/json.mts:218](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/json/json.mts#L218)

Safely converts a JavaScript record to a JSON string with keys sorted alphabetically at all levels.

This function creates deterministic JSON output by ensuring that object keys appear in
alphabetical order at every level of nesting. This is particularly useful for creating
consistent output for comparison, hashing, caching, or when you need reproducible JSON
representations across different JavaScript engines or runs.

#### Parameters

##### value

`UnknownRecord`

An object (`UnknownRecord`) to serialize. Must be a plain object
(not an array, primitive, or null). Nested objects and arrays within the object
will also have their keys sorted alphabetically.

##### space?

Optional formatting parameter:

- Number (1-10): Number of spaces to indent each level
- String: String to use for indentation (first 10 characters)
- undefined/null: No formatting (compact output)

`string` | `1` | `2` | `3` | `4` | `5` | `6` | `7` | `8` | `9` | `10`

#### Returns

[`Result`](../../../functional/result/README.md#result)\<`string`, `string`\>

A `Result<string, string>` containing:

- On success: `Result.ok(jsonString)` with all object keys sorted alphabetically
- On failure: `Result.err(errorMessage)` describing the serialization error

#### Example

```typescript
const unsortedObj = {
    zebra: 'animal',
    apple: 'fruit',
    banana: 'fruit',
};

const sorted = Json.stringifySortedKey(unsortedObj);
if (Result.isOk(sorted)) {
    console.log(sorted.value);
    // '{"apple":"fruit","banana":"fruit","zebra":"animal"}'
}
```
