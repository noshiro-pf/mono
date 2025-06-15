[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [collections/iset](../README.md) / ISet

# ISet

Provides utility functions for ISet.

## Functions

### create()

> **create**\<`K`\>(`iterable`): [`ISet`](../README.md#iset)\<`K`\>

Defined in: [src/collections/iset.mts:271](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/collections/iset.mts#L271)

Creates a new ISet instance from an iterable of elements.

This factory function accepts any iterable of elements, including arrays,
JavaScript Sets, other ISets, or custom iterables. Duplicate elements in the
input iterable will be automatically deduplicated in the resulting set.

**Performance:** O(n) where n is the number of elements in the iterable.

#### Type Parameters

##### K

`K` _extends_ `Primitive`

The type of the elements. Must extend MapSetKeyType.

#### Parameters

##### iterable

`Iterable`\<`K`\>

An iterable of elements (e.g., Array, Set, ISet, etc.)

#### Returns

[`ISet`](../README.md#iset)\<`K`\>

A new ISet instance containing all unique elements from the iterable.

#### Example

```typescript
// From array (duplicates automatically removed)
const uniqueIds = ISet.create([1, 2, 3, 2, 1]); // Contains: 1, 2, 3
console.log(uniqueIds.size); // Output: 3

// From JavaScript Set
const jsSet = new Set(['red', 'green', 'blue']);
const colors = ISet.create(jsSet);
console.log(colors.has('red')); // Output: true

// From another ISet (creates a copy)
const originalTags = ISet.create(['typescript', 'immutable']);
const copiedTags = ISet.create(originalTags);
console.log(copiedTags.size); // Output: 2

// Empty set
const emptyPermissions = ISet.create<string>([]);
console.log(emptyPermissions.isEmpty); // Output: true

// Fluent operations
const processedNumbers = ISet.create([1, 2, 3, 4, 5])
    .filter((x) => x % 2 === 0) // Keep even numbers: 2, 4
    .add(6) // Add 6: 2, 4, 6
    .delete(2); // Remove 2: 4, 6
console.log(processedNumbers.toArray().sort()); // Output: [4, 6]

// From generator function
function* generatePrimes(): Generator<number> {
    yield 2;
    yield 3;
    yield 5;
    yield 7;
}
const primes = ISet.create(generatePrimes());
console.log(primes.size); // Output: 4
```

---

### diff()

> **diff**\<`K`\>(`oldSet`, `newSet`): `ReadonlyRecord`\<`"added"` \| `"deleted"`, [`ISet`](../README.md#iset)\<`K`\>\>

Defined in: [src/collections/iset.mts:372](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/collections/iset.mts#L372)

Computes the difference between two ISet instances, identifying added and deleted elements.

This function performs a set difference operation to determine what elements were added
and what elements were deleted when transitioning from the old set to the new set.
This is useful for change detection, state management, and synchronization scenarios.

**Performance:** O(n + m) where n and m are the sizes of the old and new sets respectively.

#### Type Parameters

##### K

`K` _extends_ `Primitive`

The type of the elements.

#### Parameters

##### oldSet

[`ISet`](../README.md#iset)\<`K`\>

The original set representing the previous state.

##### newSet

[`ISet`](../README.md#iset)\<`K`\>

The new set representing the current state.

#### Returns

`ReadonlyRecord`\<`"added"` \| `"deleted"`, [`ISet`](../README.md#iset)\<`K`\>\>

An object with `added` and `deleted` properties, each containing an ISet
of elements that were added or removed respectively.

#### Example

```typescript
// User permission changes
const oldPermissions = ISet.create(['read', 'write', 'delete']);
const newPermissions = ISet.create(['read', 'write', 'execute', 'admin']);

const permissionDiff = ISet.diff(oldPermissions, newPermissions);

console.log('Permissions removed:', permissionDiff.deleted.toArray());
// Output: ["delete"]

console.log('Permissions added:', permissionDiff.added.toArray());
// Output: ["execute", "admin"]

// No changes
const unchanged1 = ISet.create(['a', 'b', 'c']);
const unchanged2 = ISet.create(['a', 'b', 'c']);
const noDiff = ISet.diff(unchanged1, unchanged2);

console.log(noDiff.added.isEmpty); // true
console.log(noDiff.deleted.isEmpty); // true

// Complete replacement
const oldTags = ISet.create(['javascript', 'react']);
const newTags = ISet.create(['typescript', 'vue']);
const tagDiff = ISet.diff(oldTags, newTags);

console.log(tagDiff.deleted.toArray()); // ["javascript", "react"]
console.log(tagDiff.added.toArray()); // ["typescript", "vue"]
```

---

### equal()

> **equal**\<`K`\>(`a`, `b`): `boolean`

Defined in: [src/collections/iset.mts:321](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/collections/iset.mts#L321)

Checks if two ISet instances are structurally equal.

Two ISets are considered equal if they have the same size and contain exactly the same
elements. The order of elements does not matter for equality comparison since sets are
unordered collections. Elements are compared using JavaScript's `===` operator.

**Performance:** O(n) where n is the size of the smaller set.

#### Type Parameters

##### K

`K` _extends_ `Primitive`

The type of the elements.

#### Parameters

##### a

[`ISet`](../README.md#iset)\<`K`\>

The first ISet instance to compare.

##### b

[`ISet`](../README.md#iset)\<`K`\>

The second ISet instance to compare.

#### Returns

`boolean`

`true` if the sets contain exactly the same elements, `false` otherwise.

#### Example

```typescript
// Basic equality comparison
const permissions1 = ISet.create(['read', 'write', 'execute']);
const permissions2 = ISet.create(['execute', 'read', 'write']); // Order doesn't matter
const permissions3 = ISet.create(['read', 'write']);

console.log(ISet.equal(permissions1, permissions2)); // true
console.log(ISet.equal(permissions1, permissions3)); // false (different sizes)

// With different element types
const numbers1 = ISet.create([1, 2, 3]);
const numbers2 = ISet.create([3, 1, 2]);
const numbers3 = ISet.create([1, 2, 4]); // Different element

console.log(ISet.equal(numbers1, numbers2)); // true
console.log(ISet.equal(numbers1, numbers3)); // false

// Empty sets
const empty1 = ISet.create<string>([]);
const empty2 = ISet.create<string>([]);
console.log(ISet.equal(empty1, empty2)); // true

// Single element sets
const single1 = ISet.create(['unique']);
const single2 = ISet.create(['unique']);
const single3 = ISet.create(['different']);

console.log(ISet.equal(single1, single2)); // true
console.log(ISet.equal(single1, single3)); // false
```

---

### intersection()

> **intersection**\<`K`\>(`a`, `b`): [`ISet`](../README.md#iset)\<`K`\>

Defined in: [src/collections/iset.mts:421](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/collections/iset.mts#L421)

Computes the intersection of two ISet instances.

Returns a new set containing only the elements that are present in both input sets.
This operation is commutative: `intersection(a, b) === intersection(b, a)`.

**Performance:** O(min(n, m)) where n and m are the sizes of the input sets.

#### Type Parameters

##### K

`K` _extends_ `Primitive`

The type of the elements.

#### Parameters

##### a

[`ISet`](../README.md#iset)\<`K`\>

The first set.

##### b

[`ISet`](../README.md#iset)\<`K`\>

The second set.

#### Returns

[`ISet`](../README.md#iset)\<`K`\>

A new ISet instance containing elements common to both sets.

#### Example

```typescript
// Finding common permissions between user and role
const userPermissions = ISet.create(['read', 'write', 'delete', 'admin']);
const rolePermissions = ISet.create(['read', 'write', 'execute']);

const commonPermissions = ISet.intersection(userPermissions, rolePermissions);
console.log(commonPermissions.toArray()); // ["read", "write"]

// No common elements
const setA = ISet.create([1, 2, 3]);
const setB = ISet.create([4, 5, 6]);
const noCommon = ISet.intersection(setA, setB);
console.log(noCommon.isEmpty); // true

// Complete overlap
const identical1 = ISet.create(['a', 'b', 'c']);
const identical2 = ISet.create(['a', 'b', 'c']);
const completeOverlap = ISet.intersection(identical1, identical2);
console.log(ISet.equal(completeOverlap, identical1)); // true

// Intersection with empty set
const nonEmpty = ISet.create([1, 2, 3]);
const empty = ISet.create<number>([]);
const withEmpty = ISet.intersection(nonEmpty, empty);
console.log(withEmpty.isEmpty); // true
```

---

### union()

> **union**\<`K1`, `K2`\>(`a`, `b`): [`ISet`](../README.md#iset)\<`K1` \| `K2`\>

Defined in: [src/collections/iset.mts:470](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/collections/iset.mts#L470)

Computes the union of two ISet instances.

Returns a new set containing all elements that are present in either input set.
Duplicate elements are automatically handled since sets only contain unique values.
This operation is commutative: `union(a, b) === union(b, a)`.

**Performance:** O(n + m) where n and m are the sizes of the input sets.

#### Type Parameters

##### K1

`K1` _extends_ `Primitive`

The type of elements in the first set.

##### K2

`K2` _extends_ `Primitive`

The type of elements in the second set.

#### Parameters

##### a

[`ISet`](../README.md#iset)\<`K1`\>

The first set.

##### b

[`ISet`](../README.md#iset)\<`K2`\>

The second set.

#### Returns

[`ISet`](../README.md#iset)\<`K1` \| `K2`\>

A new ISet instance containing all elements from both sets.

#### Example

```typescript
// Combining permissions from multiple sources
const userPermissions = ISet.create(['read', 'write']);
const rolePermissions = ISet.create(['write', 'execute', 'admin']);

const allPermissions = ISet.union(userPermissions, rolePermissions);
console.log(allPermissions.toArray().sort());
// Output: ["admin", "execute", "read", "write"]

// Union with different types (type widening)
const numbers = ISet.create([1, 2, 3]);
const strings = ISet.create(['a', 'b']);
const mixed = ISet.union(numbers, strings); // ISet<number | string>
console.log(mixed.size); // 5

// Union with empty set
const nonEmpty = ISet.create(['item1', 'item2']);
const empty = ISet.create<string>([]);
const withEmpty = ISet.union(nonEmpty, empty);
console.log(ISet.equal(withEmpty, nonEmpty)); // true

// Overlapping sets
const featuresA = ISet.create(['feature1', 'feature2', 'feature3']);
const featuresB = ISet.create(['feature2', 'feature3', 'feature4']);
const allFeatures = ISet.union(featuresA, featuresB);
console.log(allFeatures.size); // 4 (duplicates removed)
```
