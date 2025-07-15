[**Documentation**](../../README.md)

---

[Documentation](../../README.md) / collections/imap

# collections/imap

## Namespaces

- [IMap](namespaces/IMap.md)

## Type Aliases

### IMap\<K, V\>

> **IMap**\<`K`, `V`\> = `Iterable`\<readonly \[`K`, `V`\]\> & `IMapInterface`\<`K`, `V`\>

Defined in: [src/collections/imap.mts:278](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/collections/imap.mts#L278)

Represents an immutable map with high-performance operations and functional programming support.

IMap is a persistent data structure that provides all the functionality of JavaScript's Map
while maintaining immutability. All operations that would normally mutate the map instead
return new IMap instances, making it safe for functional programming and concurrent access.

**Key Features:**

- **Immutable**: All mutation operations return new instances
- **High Performance**: O(1) average-case for get/set/has/delete operations
- **Type Safe**: Full TypeScript support with generic key/value types
- **Iterable**: Implements standard JavaScript iteration protocols
- **Functional**: Rich API for map, filter, reduce-style operations

**When to Use:**

- State management in functional applications
- Caching with immutable guarantees
- Data structures that need to be shared across components
- When you need Map functionality but want immutability

#### Type Parameters

##### K

`K` _extends_ `MapSetKeyType`

The type of the keys in the map. Must extend MapSetKeyType.

##### V

`V`

The type of the values in the map.

#### Example

```typescript
// Create an immutable map with initial data
let userPreferences = IMap.create<string, UserPreference>([
    ['theme', { value: 'dark', lastModified: Date.now() }],
    ['language', { value: 'en', lastModified: Date.now() }],
]);

console.log(userPreferences.get('theme').unwrapOr(defaultPreference));
console.log(userPreferences.size); // Output: 2

// All operations return new instances - original is unchanged
const updated = userPreferences
    .set('notifications', { value: true, lastModified: Date.now() })
    .update('theme', (pref) => ({ ...pref, value: 'light' }));

console.log(userPreferences.has('notifications')); // false (original unchanged)
console.log(updated.has('notifications')); // true (new instance)

// Efficient iteration and transformation
for (const [key, preference] of updated) {
    console.log(`${key}: ${preference.value}`);
}

// Functional transformations
const withTimestamps = updated.map((pref, key) => ({
    ...pref,
    accessedAt: Date.now(),
}));

// Type-safe operations with narrowing
const stringKeys = IMap.create<number | string, any>([
    [1, 'a'],
    ['b', 2],
]);
const onlyStringKeys = stringKeys.mapKeys((key) =>
    typeof key === 'string' ? key : key.toString(),
);
```
