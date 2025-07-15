[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [collections/iset-mapped](../README.md) / ISetMapped

# ISetMapped

Provides utility functions for ISetMapped.

## Functions

### create()

> **create**\<`K`, `KM`\>(`iterable`, `toKey`, `fromKey`): [`ISetMapped`](../README.md#isetmapped)\<`K`, `KM`\>

Defined in: [src/collections/iset-mapped.mts:406](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/collections/iset-mapped.mts#L406)

Creates a new ISetMapped instance with custom element transformation functions.

This factory function creates an immutable set that can use complex objects as elements
by providing bidirectional transformation functions. The `toKey` function converts
your custom element type to a primitive type that can be efficiently stored, while
`fromKey` reconstructs the original element type for iteration and access.

**Performance:** O(n) where n is the number of elements in the iterable.

#### Type Parameters

##### K

`K`

The type of the custom elements.

##### KM

`KM` _extends_ `Primitive`

The type of the mapped primitive keys.

#### Parameters

##### iterable

`Iterable`\<`K`\>

An iterable of elements using the custom element type.

##### toKey

(`a`) => `KM`

A function that converts a custom element `K` to a primitive key `KM`.
This function must be deterministic and produce unique values for unique elements.

##### fromKey

(`k`) => `K`

A function that converts a primitive key `KM` back to the custom element `K`.
This should be the inverse of `toKey`.

#### Returns

[`ISetMapped`](../README.md#isetmapped)\<`K`, `KM`\>

A new ISetMapped instance containing all unique elements from the iterable.

#### Example

```typescript
// Example 1: Product catalog with SKU-based identity
type Product = { sku: string; name: string; price: number; category: string };

const productToKey = (product: Product): string => product.sku;
const keyToProduct = (sku: string): Product => {
    // In practice, this might fetch from a product service or cache
    return {
        sku,
        name: `Product ${sku}`,
        price: 0,
        category: 'unknown',
    };
};

const productSet = ISetMapped.create<Product, string>(
    [
        {
            sku: 'LAPTOP-001',
            name: 'Gaming Laptop',
            price: 1299,
            category: 'electronics',
        },
        {
            sku: 'MOUSE-002',
            name: 'Wireless Mouse',
            price: 49,
            category: 'accessories',
        },
        {
            sku: 'LAPTOP-001',
            name: 'Gaming Laptop',
            price: 1299,
            category: 'electronics',
        }, // Duplicate SKU
    ],
    productToKey,
    keyToProduct,
);

console.log(productSet.size); // Output: 2 (duplicate removed)
console.log(
    productSet.has({
        sku: 'LAPTOP-001',
        name: 'Gaming Laptop',
        price: 1299,
        category: 'electronics',
    }),
); // true

// Example 2: Geographic locations with coordinate-based identity
type Location = { name: string; lat: number; lng: number; type: string };

const locationToKey = (loc: Location): string =>
    `${loc.lat.toFixed(6)},${loc.lng.toFixed(6)}`;
const keyToLocation = (key: string): Location => {
    const [latStr, lngStr] = key.split(',');
    return {
        name: 'Unknown Location',
        lat: parseFloat(latStr),
        lng: parseFloat(lngStr),
        type: 'point',
    };
};

const locationSet = ISetMapped.create<Location, string>(
    [
        {
            name: 'Statue of Liberty',
            lat: 40.689247,
            lng: -74.044502,
            type: 'monument',
        },
        {
            name: 'Empire State Building',
            lat: 40.748817,
            lng: -73.985428,
            type: 'building',
        },
    ],
    locationToKey,
    keyToLocation,
);

// Example 3: User entities with multi-part identity
type User = { id: number; tenant: string; email: string; active: boolean };

const userToKey = (user: User): string => `${user.tenant}:${user.id}`;
const keyToUser = (key: string): User => {
    const [tenant, idStr] = key.split(':');
    return {
        id: Number(idStr),
        tenant,
        email: `user${idStr}@${tenant}.com`,
        active: true,
    };
};

const userSet = ISetMapped.create<User, string>([], userToKey, keyToUser)
    .add({ id: 1, tenant: 'acme', email: 'alice@acme.com', active: true })
    .add({ id: 2, tenant: 'acme', email: 'bob@acme.com', active: false });

console.log(userSet.size); // Output: 2

// Example 4: Empty set with type specification
const emptyProductSet = ISetMapped.create<Product, string>(
    [],
    productToKey,
    keyToProduct,
);
console.log(emptyProductSet.isEmpty); // Output: true
```

---

### diff()

> **diff**\<`K`, `KM`\>(`oldSet`, `newSet`): `ReadonlyRecord`\<`"added"` \| `"deleted"`, [`ISetMapped`](../README.md#isetmapped)\<`K`, `KM`\>\>

Defined in: [src/collections/iset-mapped.mts:547](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/collections/iset-mapped.mts#L547)

Computes the difference between two ISetMapped instances.

#### Type Parameters

##### K

`K`

The type of the elements.

##### KM

`KM` _extends_ `Primitive`

The type of the mapped keys.

#### Parameters

##### oldSet

[`ISetMapped`](../README.md#isetmapped)\<`K`, `KM`\>

The original set.

##### newSet

[`ISetMapped`](../README.md#isetmapped)\<`K`, `KM`\>

The new set.

#### Returns

`ReadonlyRecord`\<`"added"` \| `"deleted"`, [`ISetMapped`](../README.md#isetmapped)\<`K`, `KM`\>\>

An object containing sets of added and deleted elements.

#### Example

```typescript
type Tag = { name: string };
const tagToKey = (t: Tag): string => t.name;
const keyToTag = (name: string): Tag => ({ name });

const oldTags = ISetMapped.create<Tag, string>(
    [{ name: 'typescript' }, { name: 'javascript' }],
    tagToKey,
    keyToTag,
);
const newTags = ISetMapped.create<Tag, string>(
    [{ name: 'javascript' }, { name: 'react' }, { name: 'nextjs' }],
    tagToKey,
    keyToTag,
);

const diffResult = ISetMapped.diff(oldTags, newTags);

console.log(
    'Deleted tags:',
    diffResult.deleted.toArray().map((t) => t.name),
);
// Output: Deleted tags: ["typescript"]

console.log(
    'Added tags:',
    diffResult.added.toArray().map((t) => t.name),
);
// Output: Added tags: ["react", "nextjs"]
```

---

### equal()

> **equal**\<`K`, `KM`\>(`a`, `b`): `boolean`

Defined in: [src/collections/iset-mapped.mts:509](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/collections/iset-mapped.mts#L509)

Checks if two ISetMapped instances are structurally equal.

Two ISetMapped instances are considered equal if they have the same size and contain
exactly the same elements. The comparison is performed on the underlying mapped keys,
so the transformation functions themselves don't need to be identical. Elements are
compared based on their mapped key representations.

**Performance:** O(n) where n is the size of the smaller set.

#### Type Parameters

##### K

`K`

The type of the custom elements.

##### KM

`KM` _extends_ `Primitive`

The type of the mapped primitive keys.

#### Parameters

##### a

[`ISetMapped`](../README.md#isetmapped)\<`K`, `KM`\>

The first ISetMapped instance to compare.

##### b

[`ISetMapped`](../README.md#isetmapped)\<`K`, `KM`\>

The second ISetMapped instance to compare.

#### Returns

`boolean`

`true` if the sets contain exactly the same elements, `false` otherwise.

#### Example

```typescript
// Example with coordinate-based elements
type Point = { x: number; y: number; label?: string };
const pointToKey = (p: Point): string => `${p.x},${p.y}`;
const keyToPoint = (s: string): Point => {
    const [x, y] = s.split(',').map(Number);
    return { x, y };
};

const set1 = ISetMapped.create<Point, string>(
    [
        { x: 1, y: 2, label: 'A' },
        { x: 3, y: 4, label: 'B' },
    ],
    pointToKey,
    keyToPoint,
);

const set2 = ISetMapped.create<Point, string>(
    [
        { x: 3, y: 4, label: 'Different' },
        { x: 1, y: 2, label: 'Labels' },
    ], // Order doesn't matter
    pointToKey,
    keyToPoint,
);

const set3 = ISetMapped.create<Point, string>(
    [
        { x: 1, y: 2 },
        { x: 5, y: 6 },
    ], // Different point
    pointToKey,
    keyToPoint,
);

console.log(ISetMapped.equal(set1, set2)); // true (same coordinates, labels don't affect equality)
console.log(ISetMapped.equal(set1, set3)); // false (different coordinates)

// Example with user entities
type User = { id: number; department: string; name: string };
const userToKey = (u: User): string => `${u.department}:${u.id}`;
const keyToUser = (k: string): User => {
    const [department, idStr] = k.split(':');
    return { id: Number(idStr), department, name: '' };
};

const users1 = ISetMapped.create<User, string>(
    [
        { id: 1, department: 'eng', name: 'Alice' },
        { id: 2, department: 'sales', name: 'Bob' },
    ],
    userToKey,
    keyToUser,
);

const users2 = ISetMapped.create<User, string>(
    [
        { id: 2, department: 'sales', name: 'Robert' }, // Different name, same identity
        { id: 1, department: 'eng', name: 'Alicia' }, // Different name, same identity
    ],
    userToKey,
    keyToUser,
);

console.log(ISetMapped.equal(users1, users2)); // true (same department:id combinations)

// Empty sets
const empty1 = ISetMapped.create<Point, string>([], pointToKey, keyToPoint);
const empty2 = ISetMapped.create<Point, string>([], pointToKey, keyToPoint);
console.log(ISetMapped.equal(empty1, empty2)); // true

// Sets with different transformation functions but same logical content
const alternativePointToKey = (p: Point): string => `(${p.x},${p.y})`; // Different format
const alternativeKeyToPoint = (s: string): Point => {
    const match = s.match(/\((\d+),(\d+)\)/)!;
    return { x: Number(match[1]), y: Number(match[2]) };
};

const set4 = ISetMapped.create<Point, string>(
    [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
    ],
    alternativePointToKey,
    alternativeKeyToPoint,
);

// This would be false because the underlying mapped keys are different
console.log(ISetMapped.equal(set1, set4)); // false
```

---

### intersection()

> **intersection**\<`K`, `KM`\>(`a`, `b`): [`ISetMapped`](../README.md#isetmapped)\<`K`, `KM`\>

Defined in: [src/collections/iset-mapped.mts:583](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/collections/iset-mapped.mts#L583)

Computes the intersection of two ISetMapped instances.

#### Type Parameters

##### K

`K`

The type of the elements.

##### KM

`KM` _extends_ `Primitive`

The type of the mapped keys.

#### Parameters

##### a

[`ISetMapped`](../README.md#isetmapped)\<`K`, `KM`\>

The first set.

##### b

[`ISetMapped`](../README.md#isetmapped)\<`K`, `KM`\>

The second set.

#### Returns

[`ISetMapped`](../README.md#isetmapped)\<`K`, `KM`\>

A new ISetMapped instance representing the intersection.

#### Example

```typescript
type Permission = { id: string };
const permToKey = (p: Permission): string => p.id;
const keyToPerm = (id: string): Permission => ({ id });

const userPermissions = ISetMapped.create<Permission, string>(
    [{ id: 'read' }, { id: 'write' }, { id: 'delete' }],
    permToKey,
    keyToPerm,
);
const rolePermissions = ISetMapped.create<Permission, string>(
    [{ id: 'read' }, { id: 'comment' }, { id: 'write' }],
    permToKey,
    keyToPerm,
);

const commonPermissions = ISetMapped.intersection(
    userPermissions,
    rolePermissions,
);
console.log(commonPermissions.toArray().map((p) => p.id)); // Output: ["read", "write"]
```

---

### union()

> **union**\<`K`, `KM`\>(`a`, `b`): [`ISetMapped`](../README.md#isetmapped)\<`K`, `KM`\>

Defined in: [src/collections/iset-mapped.mts:618](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/collections/iset-mapped.mts#L618)

Computes the union of two ISetMapped instances.

#### Type Parameters

##### K

`K`

The type of the elements.

##### KM

`KM` _extends_ `Primitive`

The type of the mapped keys.

#### Parameters

##### a

[`ISetMapped`](../README.md#isetmapped)\<`K`, `KM`\>

The first set.

##### b

[`ISetMapped`](../README.md#isetmapped)\<`K`, `KM`\>

The second set.

#### Returns

[`ISetMapped`](../README.md#isetmapped)\<`K`, `KM`\>

A new ISetMapped instance representing the union.

#### Example

```typescript
type FeatureFlag = { flagName: string };
const flagToKey = (f: FeatureFlag): string => f.flagName;
const keyToFlag = (name: string): FeatureFlag => ({ flagName: name });

const setA = ISetMapped.create<FeatureFlag, string>(
    [{ flagName: 'newUI' }, { flagName: 'betaFeature' }],
    flagToKey,
    keyToFlag,
);
const setB = ISetMapped.create<FeatureFlag, string>(
    [{ flagName: 'betaFeature' }, { flagName: 'darkMode' }],
    flagToKey,
    keyToFlag,
);

const combinedFlags = ISetMapped.union(setA, setB);
// The order might vary as sets are unordered internally.
console.log(
    combinedFlags
        .toArray()
        .map((f) => f.flagName)
        .toSorted(),
);
// Output: ["betaFeature", "darkMode", "newUI"]
```
