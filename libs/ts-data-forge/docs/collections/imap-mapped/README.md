[**ts-data-forge**](../../README.md)

---

[ts-data-forge](../../README.md) / collections/imap-mapped

# collections/imap-mapped

## Namespaces

- [IMapMapped](namespaces/IMapMapped.md)

## Type Aliases

### IMapMapped

> **IMapMapped**\<`K`, `V`, `KM`\> = `Iterable`\<readonly \[`K`, `V`\]\> & `IMapMappedInterface`\<`K`, `V`, `KM`\>

Defined in: [src/collections/imap-mapped.mts:300](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/collections/imap-mapped.mts#L300)

Represents an immutable map with custom key transformation and high-performance operations.

IMapMapped is a specialized persistent data structure that enables using complex objects as map keys
while maintaining the performance benefits of JavaScript's native Map. It achieves this by requiring
bidirectional transformation functions that convert between your custom key type and a primitive type
that can be efficiently stored and compared.

**Key Features:**

- **Complex Keys**: Use objects, arrays, or any custom type as map keys
- **High Performance**: O(1) operations through efficient key transformation
- **Immutable**: All mutation operations return new instances
- **Type Safe**: Full TypeScript support with compile-time key/value type checking
- **Bidirectional**: Maintains ability to reconstruct original keys from mapped keys

**Use Cases:**

- Maps with composite keys (e.g., coordinates, user IDs with metadata)
- Caching with complex cache keys
- State management where entities have multi-part identifiers
- Performance-critical maps with non-primitive keys

#### Type Parameters

##### K

`K`

The type of the custom keys in the map.

##### V

`V`

The type of the values in the map.

##### KM

`KM` _extends_ [`MapSetKeyType`](../../globals/README.md#mapsetkeytype)

The type of the mapped primitive keys (string, number, etc.).

#### Example

```typescript
// Example: Product catalog with composite keys
type ProductKey = { brand: string; model: string; year: number };
type Product = { name: string; price: number; inStock: boolean };

// Define bidirectional transformation functions
const productKeyToString = (key: ProductKey): string =>
    `${key.brand}|${key.model}|${key.year}`;

const stringToProductKey = (str: string): ProductKey => {
    const [brand, model, yearStr] = str.split('|');
    return { brand, model, year: Number(yearStr) };
};

// Create a map with complex keys
let catalog = IMapMapped.create<ProductKey, Product, string>(
    [],
    productKeyToString,
    stringToProductKey,
);

// Use complex objects as keys naturally
const toyotaCamry2023: ProductKey = {
    brand: 'Toyota',
    model: 'Camry',
    year: 2023,
};
const hondaAccord2022: ProductKey = {
    brand: 'Honda',
    model: 'Accord',
    year: 2022,
};

catalog = catalog
    .set(toyotaCamry2023, {
        name: 'Toyota Camry 2023',
        price: 28000,
        inStock: true,
    })
    .set(hondaAccord2022, {
        name: 'Honda Accord 2022',
        price: 26500,
        inStock: false,
    });

// All operations work with the original key type
console.log(catalog.get(toyotaCamry2023).unwrapOr(notFound).name);
// Output: "Toyota Camry 2023"

console.log(catalog.has(hondaAccord2022)); // Output: true
console.log(catalog.size); // Output: 2

// Iteration preserves original key types
for (const [productKey, product] of catalog) {
    console.log(
        `${productKey.brand} ${productKey.model} (${productKey.year}): $${product.price}`,
    );
}
// Output:
// Toyota Camry (2023): $28000
// Honda Accord (2022): $26500

// Functional transformations work seamlessly
const discountedCatalog = catalog.map((product, key) => ({
    ...product,
    price: Math.round(product.price * 0.9), // 10% discount
}));
```
