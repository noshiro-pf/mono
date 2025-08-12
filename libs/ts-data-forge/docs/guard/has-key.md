[**ts-data-forge**](../README.md)

---

[ts-data-forge](../README.md) / guard/has-key

# guard/has-key

## Functions

### hasKey()

> **hasKey**\<`R`, `K`\>(`obj`, `key`): `obj is HasKeyReturnType<R, K>`

Defined in: [src/guard/has-key.mts:91](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/guard/has-key.mts#L91)

Type guard function that checks if an object has a specific key as its own property.

This function uses `Object.hasOwn()` to check if the given object has the specified key
as its own property (not inherited). It acts as a type guard that narrows the type of the
object to guarantee the key exists, enabling type-safe property access.

**Type Narrowing Behavior:**

- When the guard returns `true`, TypeScript narrows the object type to include the checked key
- For union types, only union members that contain the key are preserved
- The key's value type is preserved from the original object type when possible

#### Type Parameters

##### R

`R` _extends_ `UnknownRecord`

The type of the input object, must extend UnknownRecord

##### K

`K` _extends_ `PropertyKey`

The type of the key to check for, must extend PropertyKey (string | number | symbol)

#### Parameters

##### obj

`R`

The object to check for the presence of the key

##### key

`K`

The key to check for in the object

#### Returns

`obj is HasKeyReturnType<R, K>`

`true` if the object has the specified key as its own property, `false` otherwise.
When `true`, TypeScript narrows the object type to guarantee the key exists.

#### Examples

Basic usage with known object structure:

```typescript
const obj = { a: 1, b: 'hello' };

if (hasKey(obj, 'a')) {
    // obj is narrowed to guarantee 'a' exists
    console.log(obj.a); // TypeScript knows 'a' exists and is type number
    // No need for optional chaining or undefined checks
}

if (hasKey(obj, 'c')) {
    // This block won't execute at runtime
    console.log(obj.c); // But TypeScript would know 'c' exists if it did
}
```

Working with dynamic objects and unknown keys:

```typescript
const dynamicObj: Record<string, unknown> = { x: 10, y: 20 };
const userInput: string = getUserInput();

if (hasKey(dynamicObj, userInput)) {
    // Safe to access the dynamic key
    const value = dynamicObj[userInput]; // Type: unknown
    console.log(`Value for ${userInput}:`, value);
} else {
    console.log(`Key '${userInput}' not found`);
}
```

Type narrowing with union types:

```typescript
type UserPreferences =
    | { theme: 'dark'; notifications: boolean }
    | { theme: 'light' }
    | { autoSave: true; interval: number };

const preferences: UserPreferences = getPreferences();

if (hasKey(preferences, 'theme')) {
    // preferences is narrowed to the first two union members
    console.log(preferences.theme); // 'dark' | 'light'
}

if (hasKey(preferences, 'autoSave')) {
    // preferences is narrowed to the third union member
    console.log(preferences.interval); // number (we know this exists)
}
```

Basic usage with isRecord for progressive narrowing:

```typescript
const data: unknown = parseApiResponse();

if (isRecord(data) && hasKey(data, 'user')) {
    // data is now Record<string, unknown> with guaranteed 'user' key
    const user = data.user;

    if (isRecord(user) && hasKey(user, 'name')) {
        // Safely access nested properties
        console.log('User name:', user.name);
    }
}
```

#### See

keyIsIn - Similar function that narrows the key type instead of the object type
