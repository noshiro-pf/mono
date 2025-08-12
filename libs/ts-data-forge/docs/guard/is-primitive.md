[**ts-data-forge**](../README.md)

---

[ts-data-forge](../README.md) / guard/is-primitive

# guard/is-primitive

## Functions

### isPrimitive()

> **isPrimitive**(`u`): `u is Primitive`

Defined in: [src/guard/is-primitive.mts:147](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/guard/is-primitive.mts#L147)

Type guard that checks if a value is a primitive type.

This function identifies JavaScript primitive types, which are immutable data types that are
not objects. The primitive types are: `string`, `number`, `boolean`, `undefined`, `symbol`,
`bigint`, and `null`.

**Important Note:** Although `null` has `typeof null === "object"` due to a historical
JavaScript quirk, this function correctly identifies `null` as a primitive value.

**Type Narrowing Behavior:**

- Narrows the input type to `Primitive` (union of all primitive types)
- Excludes object types, arrays, functions, and other non-primitive values
- Includes `null` despite its misleading `typeof` result

#### Parameters

##### u

`unknown`

The value to check

#### Returns

`u is Primitive`

`true` if `u` is a primitive type, `false` otherwise.
When `true`, TypeScript narrows the type to `Primitive`.

#### Examples

Basic usage with different value types:

```typescript
isPrimitive('hello'); // true (string)
isPrimitive(42); // true (number)
isPrimitive(true); // true (boolean)
isPrimitive(undefined); // true (undefined)
isPrimitive(Symbol('test')); // true (symbol)
isPrimitive(123n); // true (bigint)
isPrimitive(null); // true (null is primitive despite typeof quirk)

isPrimitive({}); // false (object)
isPrimitive([]); // false (array)
isPrimitive(() => {}); // false (function)
isPrimitive(new Date()); // false (object instance)
isPrimitive(/regex/); // false (RegExp object)
```

Type guard usage for separating primitives from objects:

```typescript
const values: unknown[] = [
    'string',
    42,
    true,
    null,
    undefined,
    {},
    [],
    new Date(),
];

const primitives = values.filter(isPrimitive);
const objects = values.filter((value) => !isPrimitive(value));

primitives.forEach((primitive) => {
    // primitive is now typed as Primitive
    console.log('Primitive value:', primitive);
    console.log('Type:', typeof primitive);
});
```

Deep cloning detection - primitives don't need cloning:

```typescript
function deepClone<T>(value: T): T {
    if (isPrimitive(value)) {
        // Primitives are immutable, return as-is
        return value;
    }

    // Handle object cloning for non-primitives
    if (Array.isArray(value)) {
        return value.map(deepClone) as T;
    }

    if (isRecord(value)) {
        const cloned = {} as T;
        for (const key in value) {
            if (Object.hasOwn(value, key)) {
                cloned[key] = deepClone(value[key]);
            }
        }
        return cloned;
    }

    // For other object types, return as-is or implement specific cloning
    return value;
}
```

Serialization helpers:

```typescript
function canSerializeDirectly(value: unknown): boolean {
    if (isPrimitive(value)) {
        // Most primitives can be serialized directly
        return typeof value !== 'symbol' && typeof value !== 'bigint';
    }
    return false;
}

function safeStringify(value: unknown): string {
    if (isPrimitive(value)) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'symbol') return value.toString();
        if (typeof value === 'bigint') return value.toString() + 'n';
        return String(value);
    }

    return JSON.stringify(value);
}
```

Type narrowing in conditional logic:

```typescript
function processValue(value: unknown): string {
    if (isPrimitive(value)) {
        // value is now Primitive type
        switch (typeof value) {
            case 'string':
                return `String: ${value}`;
            case 'number':
                return `Number: ${value}`;
            case 'boolean':
                return `Boolean: ${value}`;
            case 'undefined':
                return 'Undefined';
            case 'symbol':
                return `Symbol: ${value.description || 'unnamed'}`;
            case 'bigint':
                return `BigInt: ${value}n`;
            case 'object': // This is null
                return 'Null';
            default:
                return 'Unknown primitive';
        }
    } else {
        return `Object: ${value?.constructor?.name || 'Unknown'}`;
    }
}
```
