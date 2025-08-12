[**ts-data-forge**](../README.md)

---

[ts-data-forge](../README.md) / guard/is-non-null-object

# guard/is-non-null-object

## Functions

### isNonNullObject()

> **isNonNullObject**(`u`): `u is object`

Defined in: [src/guard/is-non-null-object.mts:105](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/guard/is-non-null-object.mts#L105)

Type guard that checks if a value is a non-null object.

This function checks if a value has type `"object"` according to the `typeof` operator
and is not `null`. This includes all object types such as plain objects, arrays, dates,
regular expressions, and other object instances, but excludes functions.

**Type Narrowing Behavior:**

- Narrows `unknown` to `object`
- Excludes `null`, `undefined`, and all primitive types
- Excludes functions (they have `typeof` === `"function"`, not `"object"`)
- Includes arrays, dates, regex, and other object instances

**Note:** This function returns `true` for arrays. If you need to check for plain objects
specifically (excluding arrays), use `isRecord()` instead.

#### Parameters

##### u

`unknown`

The value to check

#### Returns

`u is object`

`true` if `u` is an object and not `null`, `false` otherwise.
When `true`, TypeScript narrows the type to `object`.

#### Examples

Basic usage with different value types:

```typescript
isNonNullObject({}); // true (plain object)
isNonNullObject([]); // true (arrays are objects)
isNonNullObject(new Date()); // true (Date instance)
isNonNullObject(/regex/); // true (RegExp instance)
isNonNullObject(new Map()); // true (Map instance)
isNonNullObject(null); // false (null is not considered object here)
isNonNullObject(undefined); // false (primitive)
isNonNullObject('string'); // false (primitive)
isNonNullObject(42); // false (primitive)
isNonNullObject(true); // false (primitive)
isNonNullObject(() => {}); // false (functions are not objects in this context)
```

Type guard usage with unknown values:

```typescript
const value: unknown = parseJsonData();

if (isNonNullObject(value)) {
    // value is now typed as object
    console.log('Value is an object');

    // You can now safely use object-specific operations
    console.log(Object.keys(value)); // Safe to call Object.keys
    console.log(value.toString()); // Safe to call methods

    // But you may need additional checks for specific object types
    if (Array.isArray(value)) {
        console.log("It's an array with length:", value.length);
    }
} else {
    console.log('Value is not an object');
}
```

Filtering arrays to find objects:

```typescript
const mixedArray: unknown[] = [
    { name: 'John' },
    'string',
    [1, 2, 3],
    42,
    null,
    new Date(),
    () => 'function',
];

const objects = mixedArray.filter(isNonNullObject);
// objects contains: [{ name: 'John' }, [1, 2, 3], Date instance]
// Note: includes both plain objects and arrays

objects.forEach((obj) => {
    // Each obj is guaranteed to be an object
    console.log('Object type:', obj.constructor.name);
});
```

Progressive type narrowing with other guards:

```typescript
const apiResponse: unknown = await fetchData();

if (isNonNullObject(apiResponse)) {
    // apiResponse is now object

    if (isRecord(apiResponse)) {
        // Further narrowed to UnknownRecord (plain object, not array)

        if (hasKey(apiResponse, 'status')) {
            console.log('API status:', apiResponse.status);
        }
    } else if (Array.isArray(apiResponse)) {
        console.log('Response is an array with length:', apiResponse.length);
    }
}
```

#### See

isRecord - For checking plain objects specifically (excludes arrays)
