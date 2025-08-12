[**ts-data-forge**](../README.md)

---

[ts-data-forge](../README.md) / others/cast-mutable

# others/cast-mutable

## Functions

### castDeepMutable()

> **castDeepMutable**\<`T`\>(`readonlyValue`): `DeepMutable`\<`T`\>

Defined in: [src/others/cast-mutable.mts:111](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/others/cast-mutable.mts#L111)

Casts a readonly type `T` to its `DeepMutable<T>` equivalent, recursively removing all readonly modifiers.

**⚠️ Safety Warning**: This recursively bypasses ALL immutability guarantees in nested structures.
Extremely dangerous for complex data structures as it allows mutation at any depth.
The runtime value is unchanged - only TypeScript's type checking is affected.

#### Type Parameters

##### T

`T`

The type of the deeply readonly value

#### Parameters

##### readonlyValue

`T`

The deeply readonly value to cast to deeply mutable

#### Returns

`DeepMutable`\<`T`\>

The same value with all readonly modifiers recursively removed from its type

#### Examples

```typescript
const readonlyNested: {
    readonly a: { readonly b: readonly number[] };
} = { a: { b: [1, 2, 3] } };

const mutableNested = castDeepMutable(readonlyNested);
mutableNested.a.b.push(4); // Mutations allowed at all levels
mutableNested.a = { b: [5, 6] }; // Can replace entire objects
mutableNested.a.b[0] = 99; // Can mutate array elements
```

```typescript
// When you need to perform multiple mutations before creating new immutable state
const currentState: DeepReadonly<AppState> = getState();
const draft = castDeepMutable(structuredClone(currentState)); // Clone first!

// Perform multiple mutations on the draft
draft.users.push(newUser);
draft.settings.theme = 'dark';
draft.data.items[0].completed = true;

// Create new immutable state from the mutated draft
const newState = castDeepReadonly(draft);
setState(newState);
```

```typescript
type DeepReadonlyUser = DeepReadonly<{
    id: number;
    profile: {
        settings: {
            preferences: string[];
        };
    };
}>;

function updateUserPreferences(user: DeepReadonlyUser, newPref: string) {
    // Create a mutable copy to work with
    const mutableUser = castDeepMutable(structuredClone(user));
    mutableUser.profile.settings.preferences.push(newPref);
    return castDeepReadonly(mutableUser);
}
```

#### See

- castMutable - For shallow mutability casting
- castDeepReadonly - For the opposite operation
- structuredClone - Recommended for creating safe copies before mutation

---

### castMutable()

> **castMutable**\<`T`\>(`readonlyValue`): `Mutable`\<`T`\>

Defined in: [src/others/cast-mutable.mts:46](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/others/cast-mutable.mts#L46)

Casts a readonly type `T` to its `Mutable<T>` equivalent.

**⚠️ Safety Warning**: This is a type assertion that bypasses TypeScript's immutability guarantees.
The runtime value remains unchanged - only the type system's view of it changes.
Use with caution as it can lead to unexpected mutations of data that was intended to be immutable.

#### Type Parameters

##### T

`T`

The type of the readonly value

#### Parameters

##### readonlyValue

`T`

The readonly value to cast to mutable

#### Returns

`Mutable`\<`T`\>

The same value with readonly modifiers removed from its type

#### Examples

```typescript
const readonlyArr: readonly number[] = [1, 2, 3];
const mutableArr = castMutable(readonlyArr);
mutableArr.push(4); // Now allowed by TypeScript

const readonlyObj: { readonly x: number } = { x: 1 };
const mutableObj = castMutable(readonlyObj);
mutableObj.x = 2; // Now allowed by TypeScript
```

```typescript
// Some APIs require mutable arrays but you have readonly data
const readonlyData: readonly string[] = ['a', 'b', 'c'];
const sortedData = castMutable([...readonlyData]); // Create a copy first!
legacyApi.sort(sortedData); // API mutates the array
```

```typescript
// ❌ Bad: Mutating data that other code expects to be immutable
const sharedConfig: Readonly<Config> = getConfig();
const mutable = castMutable(sharedConfig);
mutable.apiKey = 'new-key'; // Dangerous! Other code expects this to be immutable

// ✅ Good: Create a copy if you need to mutate
const configCopy = castMutable({ ...sharedConfig });
configCopy.apiKey = 'new-key'; // Safe - operating on a copy
```

#### See

- castDeepMutable - For deeply nested readonly structures
- castReadonly - For the opposite operation
