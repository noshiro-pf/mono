[**ts-type-forge**](../README.md)

---

[ts-type-forge](../README.md) / constants/record

# constants/record

## Type Aliases

### UnknownRecord

> **UnknownRecord** = [`ReadonlyRecord`](../record/std.md#readonlyrecord)\<`string`, `unknown`\>

Defined in: [constants/record.d.mts:34](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/record.d.mts#L34)

Represents a generic readonly record (object) type where keys are strings
and values are of type `unknown`.

This is a safer alternative to `Record<string, any>` or `{ [key: string]: any }`
as it uses `unknown` instead of `any`, providing better type safety while
still allowing flexibility for objects with unknown structure.

The readonly modifier ensures the object cannot be modified after creation,
making it suitable for configuration objects, API responses, or other
immutable data structures.

#### Example

```ts
// Safe handling of unknown objects
const processData = (data: UnknownRecord) => {
    // Must use type guards to access properties safely
    if ('name' in data && typeof data.name === 'string') {
        console.log(data.name);
    }
};

// Configuration object
const config: UnknownRecord = {
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3,
};

// Unlike `any`, this requires type checking
// const name = data.name; // Error without type guard
```
