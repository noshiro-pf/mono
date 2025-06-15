[**Documentation**](../README.md)

---

[Documentation](../README.md) / guard/is-record

# guard/is-record

## Functions

### isRecord()

> **isRecord**(`u`): `u is UnknownRecord`

Defined in: [src/guard/is-record.mts:152](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/guard/is-record.mts#L152)

Type guard that checks if a value is a plain object (record) - a non-null object that is not an array.

This function is useful for identifying "plain" JavaScript objects (also called records or
dictionaries) - objects that are typically used as key-value collections. It excludes arrays,
functions, and special object types like Date, RegExp, etc., focusing on objects that can be
safely treated as property collections.

**Type Narrowing Behavior:**

- Narrows `unknown` to `UnknownRecord` (equivalent to `Record<PropertyKey, unknown>`)
- Excludes `null`, `undefined`, primitives, arrays, and functions
- Returns `true` for plain objects `{}`, object literals, and objects created with `Object.create()`
- Returns `false` for arrays, even though they are technically objects

**Implementation:** Uses `isNonNullObject()` to check for objects, then `Array.isArray()` to exclude arrays.

#### Parameters

##### u

`unknown`

The value to check

#### Returns

`u is UnknownRecord`

`true` if `u` is a non-null object and not an array, `false` otherwise.
When `true`, TypeScript narrows the type to `UnknownRecord`.

#### Examples

Basic usage with different value types:

```typescript
isRecord({}); // true (empty object)
isRecord({ name: 'John' }); // true (object literal)
isRecord(Object.create(null)); // true (object created with Object.create)
isRecord(new Object()); // true (object constructor)

isRecord([]); // false (array)
isRecord([1, 2, 3]); // false (array with elements)
isRecord(null); // false (null)
isRecord(undefined); // false (undefined)
isRecord('string'); // false (primitive)
isRecord(42); // false (primitive)
isRecord(() => {}); // false (function)
isRecord(new Date()); // false (Date object - not a plain record)
isRecord(/regex/); // false (RegExp object)
```

Type guard usage for safe property access:

```typescript
const apiResponse: unknown = await fetchUserData();

if (isRecord(apiResponse)) {
    // apiResponse is now typed as UnknownRecord
    console.log('Response keys:', Object.keys(apiResponse));

    // Safe to access properties (though values are still unknown)
    const userId = apiResponse.id; // Type: unknown
    const userName = apiResponse.name; // Type: unknown

    // You can combine with other type guards for further narrowing
    if (hasKey(apiResponse, 'id') && isString(apiResponse.id)) {
        console.log('User ID:', apiResponse.id); // Now safely typed as string
    }
} else {
    console.log('API response is not a valid object');
}
```

Filtering mixed arrays to find plain objects:

```typescript
const mixedData: unknown[] = [
    { type: 'user', name: 'Alice' },
    [1, 2, 3],
    'string',
    { type: 'admin', permissions: ['read', 'write'] },
    new Date(),
    null,
    { id: 123 },
];

const records = mixedData.filter(isRecord);
// records contains only the plain objects:
// [{ type: 'user', name: 'Alice' }, { type: 'admin', permissions: [...] }, { id: 123 }]

records.forEach((record) => {
    // Each record is guaranteed to be UnknownRecord
    const keys = Object.keys(record);
    console.log('Object keys:', keys);
});
```

Progressive validation of nested structures:

```typescript
interface User {
    id: string;
    profile: {
        name: string;
        email: string;
    };
}

function validateUser(data: unknown): User | null {
    if (!isRecord(data)) {
        return null;
    }

    // data is now UnknownRecord
    if (!hasKey(data, 'id') || !isString(data.id)) {
        return null;
    }

    if (!hasKey(data, 'profile') || !isRecord(data.profile)) {
        return null;
    }

    const profile = data.profile;
    if (
        !hasKey(profile, 'name') ||
        !isString(profile.name) ||
        !hasKey(profile, 'email') ||
        !isString(profile.email)
    ) {
        return null;
    }

    return {
        id: data.id,
        profile: {
            name: profile.name,
            email: profile.email,
        },
    };
}
```

Object transformation and mapping:

```typescript
function transformRecords(data: unknown[]): Record<string, unknown>[] {
    return data
        .filter(isRecord) // Keep only plain objects
        .map((record) => {
            // Transform each record
            const transformed: Record<string, unknown> = {};

            for (const [key, value] of Object.entries(record)) {
                // Apply some transformation logic
                transformed[key.toLowerCase()] = value;
            }

            return transformed;
        });
}
```

#### See

- [isNonNullObject](is-non-null-object.md#isnonnullobject) - For checking any object type (includes arrays)
- hasKey - For checking if a record has specific keys
