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

Defined in: [src/json/json.mts:131](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/json/json.mts#L131)

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
// Parse simple values
const str = Json.parse('"hello"');
// Result.ok('hello')

const num = Json.parse('42');
// Result.ok(42)

const bool = Json.parse('true');
// Result.ok(true)

const nul = Json.parse('null');
// Result.ok(null)
```

```typescript
const obj = Json.parse('{"name": "John", "age": 30, "active": true}');
if (Result.isOk(obj)) {
    console.log(obj.value.name); // 'John'
    console.log(obj.value.age); // 30
}

const arr = Json.parse('[1, "two", true, null]');
if (Result.isOk(arr)) {
    console.log(arr.value); // [1, 'two', true, null]
}
```

```typescript
const invalid = Json.parse('invalid json');
if (Result.isErr(invalid)) {
    console.log('Parse failed:', invalid.value);
    // Parse failed: Unexpected token i in JSON at position 0
}

const malformed = Json.parse('{"missing": quote}');
if (Result.isErr(malformed)) {
    console.log('Parse failed:', malformed.value);
    // Parse failed: Unexpected token q in JSON at position 12
}
```

```typescript
// Convert ISO date strings to Date objects
const dateReviver = (key: string, value: unknown): unknown => {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
        return new Date(value);
    }
    return value;
};

const result = Json.parse(
    '{"event": "Meeting", "date": "2023-12-25T10:00:00Z"}',
    dateReviver,
);
if (Result.isOk(result)) {
    console.log(result.value.date instanceof Date); // true
}
```

```typescript
import { isRecord, hasKey } from 'ts-data-forge';

const validateApiResponse = (jsonString: string) => {
    const parseResult = Json.parse(jsonString);

    if (Result.isErr(parseResult)) {
        return Result.err(`Invalid JSON: ${parseResult.value}`);
    }

    const data = parseResult.value;
    if (!isRecord(data) || !hasKey(data, 'status')) {
        return Result.err('Missing required "status" field');
    }

    return Result.ok(data);
};
```

---

### stringify()

> **stringify**(`value`, `replacer?`, `space?`): [`Result`](../../../functional/result/README.md#result)\<`string`, `string`\>

Defined in: [src/json/json.mts:296](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/json/json.mts#L296)

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
// Primitives
const str = Json.stringify('hello');
// Result.ok('"hello"')

const num = Json.stringify(42);
// Result.ok('42')

const bool = Json.stringify(true);
// Result.ok('true')

const nul = Json.stringify(null);
// Result.ok('null')
```

```typescript
const obj = { name: 'John', age: 30, active: true };
const result = Json.stringify(obj);
if (Result.isOk(result)) {
    console.log(result.value); // '{"name":"John","age":30,"active":true}'
}

const arr = [1, 'two', true, null];
const arrResult = Json.stringify(arr);
if (Result.isOk(arrResult)) {
    console.log(arrResult.value); // '[1,"two",true,null]'
}
```

```typescript
const data = {
    users: [
        { name: 'Alice', id: 1 },
        { name: 'Bob', id: 2 },
    ],
};

// Pretty-print with 2 spaces
const formatted = Json.stringify(data, undefined, 2);
if (Result.isOk(formatted)) {
    console.log(formatted.value);
    // {
    //   "users": [
    //     {
    //       "name": "Alice",
    //       "id": 1
    //     },
    //     {
    //       "name": "Bob",
    //       "id": 2
    //     }
    //   ]
    // }
}

// Custom indentation string
const tabbed = Json.stringify(data, undefined, '\t');
```

```typescript
// Circular reference error
const circular: any = { name: 'test' };
circular.self = circular;
const error = Json.stringify(circular);
if (Result.isErr(error)) {
    console.log('Stringify failed:', error.value);
    // Stringify failed: Converting circular structure to JSON
}

// BigInt error
const bigIntError = Json.stringify({ big: BigInt(123) });
if (Result.isErr(bigIntError)) {
    console.log('Stringify failed:', bigIntError.value);
    // Stringify failed: Do not know how to serialize a BigInt
}
```

```typescript
// Filter out sensitive data
const sensitiveData = {
    name: 'John',
    password: 'secret123',
    email: 'john@example.com',
};

const secureReplacer = (key: string, value: unknown) => {
    if (key === 'password') return '[REDACTED]';
    return value;
};

const safe = Json.stringify(sensitiveData, secureReplacer);
if (Result.isOk(safe)) {
    console.log(safe.value);
    // '{"name":"John","password":"[REDACTED]","email":"john@example.com"}'
}

// Convert Dates to custom format
const data = { event: 'Meeting', date: new Date('2023-12-25T10:00:00Z') };
const dateReplacer = (key: string, value: unknown) => {
    if (value instanceof Date) return value.toISOString().split('T')[0]; // YYYY-MM-DD
    return value;
};

const result = Json.stringify(data, dateReplacer);
if (Result.isOk(result)) {
    console.log(result.value); // '{"event":"Meeting","date":"2023-12-25"}'
}
```

```typescript
// Functions, undefined, and symbols are omitted in objects
const obj = {
    name: 'test',
    fn: () => {}, // omitted
    undef: undefined, // omitted
    sym: Symbol('test'), // omitted
    num: 42,
};
const result = Json.stringify(obj);
// Result.ok('{"name":"test","num":42}')

// In arrays, they become null
const arr = ['string', () => {}, undefined, Symbol('test'), 42];
const arrResult = Json.stringify(arr);
// Result.ok('["string",null,null,null,42]')
```

---

### stringifySelected()

> **stringifySelected**(`value`, `propertiesToBeSelected?`, `space?`): [`Result`](../../../functional/result/README.md#result)\<`string`, `string`\>

Defined in: [src/json/json.mts:455](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/json/json.mts#L455)

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

#### Examples

```typescript
const user = {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    password: 'secret123',
    lastLogin: '2023-12-01',
};

// Include only public fields
const publicFields = Json.stringifySelected(user, ['id', 'name', 'email']);
if (Result.isOk(publicFields)) {
    console.log(publicFields.value);
    // '{"id":1,"name":"Alice","email":"alice@example.com"}'
}
```

```typescript
const data = {
    users: [
        { id: 1, name: 'Alice', secret: 'hidden1' },
        { id: 2, name: 'Bob', secret: 'hidden2' },
    ],
    metadata: { total: 2, page: 1 },
};

// Select specific properties across nested structures
const selected = Json.stringifySelected(data, ['users', 'id', 'name', 'total']);
if (Result.isOk(selected)) {
    console.log(selected.value);
    // '{"users":[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}],"metadata":{"total":2}}'
}
```

```typescript
const config = {
    database: { host: 'localhost', password: 'secret' },
    api: { endpoint: '/api/v1', key: 'secret-key' },
    features: { debug: true, logging: true },
};

// Create a safe config for logging (exclude sensitive fields)
const safeConfig = Json.stringifySelected(
    config,
    ['database', 'host', 'api', 'endpoint', 'features'],
    2,
);
if (Result.isOk(safeConfig)) {
    console.log(safeConfig.value);
    // {
    //   "database": {
    //     "host": "localhost"
    //   },
    //   "api": {
    //     "endpoint": "/api/v1"
    //   },
    //   "features": {
    //     "debug": true,
    //     "logging": true
    //   }
    // }
}
```

```typescript
const matrix = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
];

// Select only first two columns (indices 0 and 1)
const columns = Json.stringifySelected(matrix, [0, 1]);
if (Result.isOk(columns)) {
    console.log(columns.value);
    // '[[1,2],[5,6],[9,10]]'
}
```

```typescript
// Simulate filtering an API response
const fullResponse = {
    data: {
        users: [
            {
                id: 1,
                name: 'Alice',
                email: 'alice@example.com',
                internalId: 'usr_123',
            },
            {
                id: 2,
                name: 'Bob',
                email: 'bob@example.com',
                internalId: 'usr_456',
            },
        ],
    },
    metadata: {
        total: 2,
        internalVersion: '1.2.3',
        serverTime: Date.now(),
    },
};

// Create public API response
const publicResponse = Json.stringifySelected(fullResponse, [
    'data',
    'users',
    'id',
    'name',
    'email',
    'metadata',
    'total',
]);

if (Result.isOk(publicResponse)) {
    console.log('Public API response:', publicResponse.value);
    // Only includes id, name, email for users and total in metadata
}
```

```typescript
const circular: any = { name: 'test' };
circular.self = circular;

const result = Json.stringifySelected(circular, ['name', 'self']);
if (Result.isErr(result)) {
    console.log('Serialization failed:', result.value);
    // Even with property selection, circular references still cause errors
}
```

---

### stringifySortedKey()

> **stringifySortedKey**(`value`, `space?`): [`Result`](../../../functional/result/README.md#result)\<`string`, `string`\>

Defined in: [src/json/json.mts:649](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/json/json.mts#L649)

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

#### Examples

```typescript
const unsortedObj = {
    zebra: 'animal',
    apple: 'fruit',
    banana: 'fruit',
    aardvark: 'animal',
};

const sorted = Json.stringifySortedKey(unsortedObj);
if (Result.isOk(sorted)) {
    console.log(sorted.value);
    // '{"aardvark":"animal","apple":"fruit","banana":"fruit","zebra":"animal"}'
}

// Compare with regular stringify (order not guaranteed)
const regular = Json.stringify(unsortedObj);
// Keys might appear in insertion order or engine-dependent order
```

```typescript
const nestedObj = {
    user: {
        name: 'Alice',
        age: 30,
        address: {
            zip: '12345',
            city: 'New York',
            country: 'USA',
        },
    },
    settings: {
        theme: 'dark',
        language: 'en',
        notifications: {
            email: true,
            sms: false,
            push: true,
        },
    },
};

const sorted = Json.stringifySortedKey(nestedObj, 2);
if (Result.isOk(sorted)) {
    console.log(sorted.value);
    // {
    //   "settings": {
    //     "language": "en",
    //     "notifications": {
    //       "email": true,
    //       "push": true,
    //       "sms": false
    //     },
    //     "theme": "dark"
    //   },
    //   "user": {
    //     "address": {
    //       "city": "New York",
    //       "country": "USA",
    //       "zip": "12345"
    //     },
    //     "age": 30,
    //     "name": "Alice"
    //   }
    // }
}
```

```typescript
const dataWithArrays = {
    users: [
        { name: 'Bob', id: 2, active: true },
        { name: 'Alice', id: 1, active: false },
    ],
    metadata: {
        version: '1.0',
        created: '2023-12-01',
        author: 'system',
    },
};

const sorted = Json.stringifySortedKey(dataWithArrays);
if (Result.isOk(sorted)) {
    console.log(sorted.value);
    // Keys in objects within arrays are also sorted:
    // '{"metadata":{"author":"system","created":"2023-12-01","version":"1.0"},"users":[{"active":true,"id":2,"name":"Bob"},{"active":false,"id":1,"name":"Alice"}]}'
}
```

```typescript
// Useful for configuration files that need consistent ordering
const config = {
    database: {
        port: 5432,
        host: 'localhost',
        name: 'myapp',
        username: 'admin',
    },
    server: {
        port: 3000,
        middleware: ['cors', 'helmet', 'compression'],
        routes: {
            api: '/api/v1',
            health: '/health',
            docs: '/docs',
        },
    },
};

const consistentConfig = Json.stringifySortedKey(config, 2);
if (Result.isOk(consistentConfig)) {
    // Always produces the same key order regardless of object creation order
    console.log('Consistent config:', consistentConfig.value);
}
```

```typescript
// Useful when you need consistent JSON for hashing or comparison
const createHash = async (obj: Record<string, unknown>) => {
    const sortedJson = Json.stringifySortedKey(obj);
    if (Result.isErr(sortedJson)) {
        throw new Error(`Failed to serialize: ${sortedJson.value}`);
    }

    // Now you can safely hash the JSON string
    const encoder = new TextEncoder();
    const data = encoder.encode(sortedJson.value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
};

// These will produce the same hash regardless of property order:
const obj1 = { b: 2, a: 1, c: 3 };
const obj2 = { a: 1, c: 3, b: 2 };
// createHash(obj1) === createHash(obj2) // true
```

```typescript
const problematicObj = {
    normal: 'value',
    circular: {} as any,
};
problematicObj.circular.self = problematicObj;

const result = Json.stringifySortedKey(problematicObj);
if (Result.isErr(result)) {
    console.log('Serialization failed:', result.value);
    // Even with key sorting, circular references still cause errors
}
```
