[**ts-data-forge**](../../README.md)

---

[ts-data-forge](../../README.md) / collections/iset-mapped

# collections/iset-mapped

## Namespaces

- [ISetMapped](namespaces/ISetMapped.md)

## Type Aliases

### ISetMapped\<K, KM\>

> **ISetMapped**\<`K`, `KM`\> = `Iterable`\<`K`\> & `Readonly`\<`ISetMappedInterface`\<`K`, `KM`\>\>

Defined in: [src/collections/iset-mapped.mts:295](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/collections/iset-mapped.mts#L295)

Represents an immutable set with custom element transformation and high-performance operations.

ISetMapped is a specialized persistent data structure that enables using complex objects as set elements
while maintaining the performance benefits of JavaScript's native Set. It achieves this by requiring
bidirectional transformation functions that convert between your custom element type and a primitive type
that can be efficiently stored and compared for uniqueness.

**Key Features:**

- **Complex Elements**: Use objects, arrays, or any custom type as set elements
- **High Performance**: O(1) operations through efficient element transformation
- **Immutable**: All mutation operations return new instances
- **Type Safe**: Full TypeScript support with compile-time element type checking
- **Bidirectional**: Maintains ability to reconstruct original elements from mapped keys
- **Set Algebra**: Complete support for mathematical set operations

**Use Cases:**

- Sets of entities with complex identifiers
- Deduplication of objects based on specific properties
- Performance-critical sets with non-primitive elements
- Mathematical set operations on complex data structures

#### Type Parameters

##### K

`K`

The type of the custom elements in the set.

##### KM

`KM` _extends_ [`MapSetKeyType`](../../globals/README.md#mapsetkeytype)

The type of the mapped primitive keys (string, number, etc.).

#### Example

```typescript
// Example: User management with composite identity
type User = { id: number; department: string; username: string; email: string };

// Define bidirectional transformation functions
const userToKey = (user: User): string => `${user.department}:${user.id}`;
const keyToUser = (key: string): User => {
    const [department, idStr] = key.split(':');
    const id = Number(idStr);
    // In practice, this might fetch from a user service or cache
    return {
        id,
        department,
        username: `user${id}`,
        email: `user${id}@${department}.company.com`,
    };
};

// Create a set with complex elements
let activeUsers = ISetMapped.create<User, string>([], userToKey, keyToUser);

// Use complex objects as elements naturally
const alice: User = {
    id: 1,
    department: 'engineering',
    username: 'alice',
    email: 'alice@engineering.company.com',
};
const bob: User = {
    id: 2,
    department: 'marketing',
    username: 'bob',
    email: 'bob@marketing.company.com',
};
const charlie: User = {
    id: 3,
    department: 'engineering',
    username: 'charlie',
    email: 'charlie@engineering.company.com',
};

activeUsers = activeUsers.add(alice).add(bob).add(charlie);

// All operations work with the original element type
console.log(activeUsers.has(alice)); // Output: true
console.log(activeUsers.size); // Output: 3

// Set operations preserve element types
const engineeringUsers = ISetMapped.create<User, string>(
    [alice, charlie],
    userToKey,
    keyToUser,
);
const marketingUsers = ISetMapped.create<User, string>(
    [bob],
    userToKey,
    keyToUser,
);

const allUsers = ISetMapped.union(engineeringUsers, marketingUsers);
const engineeringOnly = activeUsers.intersect(engineeringUsers);

// Iteration preserves original element types
for (const user of engineeringOnly) {
    console.log(`${user.username} works in ${user.department}`);
}
// Output:
// alice works in engineering
// charlie works in engineering

// Functional transformations work seamlessly
const updatedUsers = activeUsers.map((user) => ({
    ...user,
    email: user.email.replace('.company.com', '.example.com'),
}));
```
