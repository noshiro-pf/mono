[**ts-data-forge**](../../README.md)

---

[ts-data-forge](../../README.md) / collections/iset

# collections/iset

## Namespaces

- [ISet](namespaces/ISet.md)

## Type Aliases

### ISet\<K\>

> **ISet**\<`K`\> = `Iterable`\<`K`\> & `ISetInterface`\<`K`\>

Defined in: [src/collections/iset.mts:217](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/collections/iset.mts#L217)

Represents an immutable set with high-performance operations and comprehensive set algebra support.

ISet is a persistent data structure that provides all the functionality of JavaScript's Set
while maintaining immutability. All operations that would normally mutate the set instead
return new ISet instances, making it safe for functional programming and concurrent access.

**Key Features:**

- **Immutable**: All mutation operations return new instances
- **High Performance**: O(1) average-case for has/add/delete operations
- **Set Operations**: Full support for union, intersection, difference, subset/superset checks
- **Type Safe**: Full TypeScript support with generic element types
- **Iterable**: Implements standard JavaScript iteration protocols
- **Functional**: Rich API for map, filter, and functional composition

**When to Use:**

- Managing collections of unique values with immutability guarantees
- Set algebra operations (unions, intersections, differences)
- Membership testing with O(1) performance
- Functional programming patterns requiring immutable collections

#### Type Parameters

##### K

`K` _extends_ [`MapSetKeyType`](../../globals/README.md#mapsetkeytype)

The type of the elements in the set. Must extend MapSetKeyType.
