[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [collections/imap-mapped](../README.md) / IMapMapped

# IMapMapped

Provides utility functions for IMapMapped.

## Functions

### create()

> **create**\<`K`, `V`, `KM`\>(`iterable`, `toKey`, `fromKey`): [`IMapMapped`](../README.md#imapmapped)\<`K`, `V`, `KM`\>

Defined in: [src/collections/imap-mapped.mts:401](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/collections/imap-mapped.mts#L401)

Creates a new IMapMapped instance with custom key transformation functions.

This factory function creates an immutable map that can use complex objects as keys
by providing bidirectional transformation functions. The `toKey` function converts
your custom key type to a primitive type that can be efficiently stored, while
`fromKey` reconstructs the original key type for iteration and access.

**Performance:** O(n) where n is the number of entries in the iterable.

#### Type Parameters

##### K

`K`

The type of the custom keys.

##### V

`V`

The type of the values.

##### KM

`KM` _extends_ `Primitive`

The type of the mapped primitive keys.

#### Parameters

##### iterable

`Iterable`\<readonly \[`K`, `V`\]\>

An iterable of key-value pairs using the custom key type.

##### toKey

(`a`) => `KM`

A function that converts a custom key `K` to a primitive key `KM`.
This function must be deterministic and produce unique values for unique keys.

##### fromKey

(`k`) => `K`

A function that converts a primitive key `KM` back to the custom key `K`.
This should be the inverse of `toKey`.

#### Returns

[`IMapMapped`](../README.md#imapmapped)\<`K`, `V`, `KM`\>

A new IMapMapped instance containing all entries from the iterable.

#### Example

```typescript
// Example 1: Geographic coordinates as keys
type Coordinate = { lat: number; lng: number };
type LocationInfo = { name: string; population: number };

const coordToString = (coord: Coordinate): string =>
    `${coord.lat},${coord.lng}`;
const stringToCoord = (str: string): Coordinate => {
    const [lat, lng] = str.split(',').map(Number);
    return { lat, lng };
};

const locationMap = IMapMapped.create<Coordinate, LocationInfo, string>(
    [
        [
            { lat: 40.7128, lng: -74.006 },
            { name: 'New York', population: 8000000 },
        ],
        [
            { lat: 34.0522, lng: -118.2437 },
            { name: 'Los Angeles', population: 4000000 },
        ],
    ],
    coordToString,
    stringToCoord,
);

const nyCoord = { lat: 40.7128, lng: -74.006 };
console.log(locationMap.get(nyCoord).unwrap().name); // Output: "New York"

// Example 2: Multi-part business keys
type OrderId = { customerId: string; year: number; orderNumber: number };

const orderIdToKey = (id: OrderId): string =>
    `${id.customerId}:${id.year}:${id.orderNumber}`;

const keyToOrderId = (key: string): OrderId => {
    const [customerId, yearStr, orderNumStr] = key.split(':');
    return {
        customerId,
        year: Number(yearStr),
        orderNumber: Number(orderNumStr),
    };
};

const orderMap = IMapMapped.create<OrderId, Order, string>(
    [],
    orderIdToKey,
    keyToOrderId,
);

// Example 3: Simple case with string keys (identity transformation)
const simpleMap = IMapMapped.create<string, number, string>(
    [
        ['key1', 100],
        ['key2', 200],
    ],
    (s) => s, // identity function
    (s) => s, // identity function
);

// Example 4: From existing data structures
const existingEntries = new Map([
    [
        { id: 1, type: 'user' },
        { name: 'Alice', active: true },
    ],
    [
        { id: 2, type: 'user' },
        { name: 'Bob', active: false },
    ],
]);

type EntityKey = { id: number; type: string };
const entityKeyToString = (key: EntityKey): string => `${key.type}_${key.id}`;
const stringToEntityKey = (str: string): EntityKey => {
    const [type, idStr] = str.split('_');
    return { type, id: Number(idStr) };
};

const entityMap = IMapMapped.create<EntityKey, Entity, string>(
    existingEntries,
    entityKeyToString,
    stringToEntityKey,
);
```

---

### equal()

> **equal**\<`K`, `V`, `KM`\>(`a`, `b`): `boolean`

Defined in: [src/collections/imap-mapped.mts:488](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/collections/imap-mapped.mts#L488)

Checks if two IMapMapped instances are structurally equal.

Two IMapMapped instances are considered equal if they have the same size and contain
exactly the same key-value pairs. The comparison is performed on the underlying mapped
keys and values, so the transformation functions themselves don't need to be identical.
Values are compared using JavaScript's `===` operator.

**Performance:** O(n) where n is the size of the smaller map.

#### Type Parameters

##### K

`K`

The type of the custom keys.

##### V

`V`

The type of the values.

##### KM

`KM` _extends_ `Primitive`

The type of the mapped primitive keys.

#### Parameters

##### a

[`IMapMapped`](../README.md#imapmapped)\<`K`, `V`, `KM`\>

The first IMapMapped instance to compare.

##### b

[`IMapMapped`](../README.md#imapmapped)\<`K`, `V`, `KM`\>

The second IMapMapped instance to compare.

#### Returns

`boolean`

`true` if the maps contain exactly the same key-value pairs, `false` otherwise.

#### Example

```typescript
// Example with coordinate keys
type Point = { x: number; y: number };
const pointToString = (p: Point): string => `${p.x},${p.y}`;
const stringToPoint = (s: string): Point => {
    const [x, y] = s.split(',').map(Number);
    return { x, y };
};

const map1 = IMapMapped.create<Point, string, string>(
    [
        [{ x: 1, y: 2 }, 'point1'],
        [{ x: 3, y: 4 }, 'point2'],
    ],
    pointToString,
    stringToPoint,
);

const map2 = IMapMapped.create<Point, string, string>(
    [
        [{ x: 1, y: 2 }, 'point1'],
        [{ x: 3, y: 4 }, 'point2'],
    ], // Same content
    pointToString,
    stringToPoint,
);

const map3 = IMapMapped.create<Point, string, string>(
    [
        [{ x: 1, y: 2 }, 'point1'],
        [{ x: 3, y: 4 }, 'different'],
    ], // Different value
    pointToString,
    stringToPoint,
);

console.log(IMapMapped.equal(map1, map2)); // true
console.log(IMapMapped.equal(map1, map3)); // false (different value)

// Order doesn't matter for equality
const map4 = IMapMapped.create<Point, string, string>(
    [
        [{ x: 3, y: 4 }, 'point2'],
        [{ x: 1, y: 2 }, 'point1'],
    ], // Different order
    pointToString,
    stringToPoint,
);

console.log(IMapMapped.equal(map1, map4)); // true

// Different transformation functions but same logical content
const alternativePointToString = (p: Point): string => `(${p.x},${p.y})`; // Different format
const alternativeStringToPoint = (s: string): Point => {
    const match = s.match(/\((\d+),(\d+)\)/);
    return { x: Number(match![1]), y: Number(match![2]) };
};

const map5 = IMapMapped.create<Point, string, string>(
    [
        [{ x: 1, y: 2 }, 'point1'],
        [{ x: 3, y: 4 }, 'point2'],
    ],
    alternativePointToString,
    alternativeStringToPoint,
);

// This would be false because the underlying mapped keys are different
// even though the logical content is the same
console.log(IMapMapped.equal(map1, map5)); // false

// Empty maps
const empty1 = IMapMapped.create<Point, string, string>(
    [],
    pointToString,
    stringToPoint,
);
const empty2 = IMapMapped.create<Point, string, string>(
    [],
    pointToString,
    stringToPoint,
);
console.log(IMapMapped.equal(empty1, empty2)); // true
```
