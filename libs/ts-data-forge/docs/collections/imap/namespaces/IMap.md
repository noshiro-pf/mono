[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [collections/imap](../README.md) / IMap

# IMap

Provides utility functions for IMap.

## Functions

### create()

> **create**\<`K`, `V`\>(`iterable`): [`IMap`](../README.md#imap)\<`K`, `V`\>

Defined in: [src/collections/imap.mts:334](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/collections/imap.mts#L334)

Creates a new IMap instance from an iterable of key-value pairs.

This factory function accepts any iterable of [key, value] tuples, including arrays,
JavaScript Maps, other IMaps, or custom iterables. The resulting IMap will contain
all the entries from the input iterable.

**Performance:** O(n) where n is the number of entries in the iterable.

#### Type Parameters

##### K

`K` _extends_ `Primitive`

The type of the keys. Must extend MapSetKeyType.

##### V

`V`

The type of the values.

#### Parameters

##### iterable

`Iterable`\<readonly \[`K`, `V`\]\>

An iterable of key-value pairs (e.g., Array, Map, IMap, etc.)

#### Returns

[`IMap`](../README.md#imap)\<`K`, `V`\>

A new IMap instance containing all entries from the iterable.

#### Example

```typescript
// From array of tuples
const userScores = IMap.create<string, number>([
    ['alice', 95],
    ['bob', 87],
    ['charlie', 92],
]);
console.log(userScores.get('alice').unwrap()); // Output: 95

// From JavaScript Map
const jsMap = new Map([
    ['config', { debug: true }],
    ['env', 'production'],
]);
const config = IMap.create(jsMap);
console.log(config.get('env').unwrap()); // Output: "production"

// From another IMap (creates a copy)
const originalMap = IMap.create<string, boolean>([['enabled', true]]);
const copiedMap = IMap.create(originalMap);
console.log(copiedMap.get('enabled').unwrap()); // Output: true

// Empty map
const emptyMap = IMap.create<string, number>([]);
console.log(emptyMap.size); // Output: 0

// From custom iterable
function* generateEntries(): Generator<[string, number]> {
    for (let i = 0; i < 3; i++) {
        yield [`item${i}`, i * 10];
    }
}
const generatedMap = IMap.create(generateEntries());
console.log(generatedMap.size); // Output: 3
```

---

### equal()

> **equal**\<`K`, `V`\>(`a`, `b`): `boolean`

Defined in: [src/collections/imap.mts:397](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/collections/imap.mts#L397)

Checks if two IMap instances are structurally equal.

Two IMaps are considered equal if they have the same size and contain exactly the same
key-value pairs. The order of entries does not matter for equality comparison.
Values are compared using JavaScript's `===` operator.

**Performance:** O(n) where n is the size of the smaller map.

#### Type Parameters

##### K

`K` _extends_ `Primitive`

The type of the keys.

##### V

`V`

The type of the values.

#### Parameters

##### a

[`IMap`](../README.md#imap)\<`K`, `V`\>

The first IMap instance to compare.

##### b

[`IMap`](../README.md#imap)\<`K`, `V`\>

The second IMap instance to compare.

#### Returns

`boolean`

`true` if the maps contain exactly the same key-value pairs, `false` otherwise.

#### Example

```typescript
// Basic equality comparison
const preferences1 = IMap.create<string, boolean>([
    ['darkMode', true],
    ['notifications', false],
]);
const preferences2 = IMap.create<string, boolean>([
    ['darkMode', true],
    ['notifications', false],
]);
const preferences3 = IMap.create<string, boolean>([
    ['notifications', false],
    ['darkMode', true], // Order doesn't matter
]);

console.log(IMap.equal(preferences1, preferences2)); // true
console.log(IMap.equal(preferences1, preferences3)); // true (order doesn't matter)

// Different values
const preferences4 = IMap.create<string, boolean>([
    ['darkMode', false], // Different value
    ['notifications', false],
]);
console.log(IMap.equal(preferences1, preferences4)); // false

// Different keys
const preferences5 = IMap.create<string, boolean>([
    ['darkMode', true],
    ['sounds', false], // Different key
]);
console.log(IMap.equal(preferences1, preferences5)); // false

// Empty maps
const empty1 = IMap.create<string, number>([]);
const empty2 = IMap.create<string, number>([]);
console.log(IMap.equal(empty1, empty2)); // true

// Note: For deep equality of object values, use a custom comparison
const users1 = IMap.create<string, User>([['1', { name: 'Alice' }]]);
const users2 = IMap.create<string, User>([['1', { name: 'Alice' }]]);
console.log(IMap.equal(users1, users2)); // false (different object references)
```
