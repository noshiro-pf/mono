[**Documentation**](../README.md)

---

[Documentation](../README.md) / others/cast-readonly

# others/cast-readonly

## Functions

### castDeepReadonly()

> **castDeepReadonly**\<`T`\>(`mutable`): `DeepReadonly`\<`T`\>

Defined in: [src/others/cast-readonly.mts:190](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/others/cast-readonly.mts#L190)

Casts a mutable type `T` to its `DeepReadonly<T>` equivalent, recursively adding readonly modifiers.

This is a safe type assertion that adds immutability constraints at ALL levels of nesting.
Provides complete protection against mutations in complex data structures.
The runtime value is unchanged - only TypeScript's type checking is enhanced.

#### Type Parameters

##### T

`T`

The type of the mutable value

#### Parameters

##### mutable

`T`

The mutable value to cast to deeply readonly

#### Returns

`DeepReadonly`\<`T`\>

The same value with readonly modifiers recursively added to all properties

#### Examples

```typescript
const mutableNested = {
    a: { b: [1, 2, 3] },
    c: { d: { e: 'value' } },
};

const readonlyNested = castDeepReadonly(mutableNested);
// readonlyNested.a.b.push(4); // ❌ Error: readonly at all levels
// readonlyNested.c.d.e = 'new'; // ❌ Error: readonly at all levels
// readonlyNested.a = {}; // ❌ Error: cannot reassign readonly property
```

```typescript
interface AppState {
    user: {
        id: number;
        profile: {
            name: string;
            settings: {
                theme: string;
                notifications: boolean[];
            };
        };
    };
    data: {
        items: Array<{ id: number; value: string }>;
    };
}

class StateManager {
    private state: AppState = initialState;

    getState(): DeepReadonly<AppState> {
        return castDeepReadonly(this.state);
    }

    // Mutations only allowed through specific methods
    updateTheme(theme: string) {
        this.state.user.profile.settings.theme = theme;
    }
}
```

```typescript
async function fetchUserData(): Promise<DeepReadonly<UserData>> {
    const response = await api.get<UserData>('/user');

    // Process and validate data...

    // Return as deeply immutable to prevent accidental mutations
    return castDeepReadonly(response.data);
}

const userData = await fetchUserData();
// userData is fully protected from mutations at any depth
// userData.preferences.emails.push('new@email.com'); // ❌ TypeScript Error
```

```typescript
// Redux reducer example
type State = DeepReadonly<AppState>;

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'UPDATE_USER_NAME':
            // Must create new objects, can't mutate
            return castDeepReadonly({
                ...state,
                user: {
                    ...state.user,
                    profile: {
                        ...state.user.profile,
                        name: action.payload,
                    },
                },
            });
        default:
            return state;
    }
}
```

```typescript
function processData<T>(data: T): DeepReadonly<T> {
    // Perform processing...
    console.log('Processing:', data);

    // Return immutable version
    return castDeepReadonly(data);
}

const result = processData({ nested: { value: [1, 2, 3] } });
// Type of result is DeepReadonly<{ nested: { value: number[] } }>
```

#### See

- castReadonly - For shallow readonly casting
- castDeepMutable - For the opposite operation (use with extreme caution)

---

### castReadonly()

> **castReadonly**\<`T`\>(`mutable`): `Readonly`\<`T`\>

Defined in: [src/others/cast-readonly.mts:73](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/others/cast-readonly.mts#L73)

Casts a mutable type `T` to its `Readonly<T>` equivalent.

This is a safe type assertion that adds immutability constraints at the type level.
The runtime value remains unchanged - only TypeScript's view of it becomes readonly.
This helps prevent accidental mutations and makes code intentions clearer.

#### Type Parameters

##### T

`T`

The type of the mutable value

#### Parameters

##### mutable

`T`

The mutable value to cast to readonly

#### Returns

`Readonly`\<`T`\>

The same value with readonly modifiers added to its type

#### Examples

```typescript
const mutableArr: number[] = [1, 2, 3];
const readonlyArr = castReadonly(mutableArr);
// readonlyArr.push(4); // ❌ TypeScript Error: no 'push' on readonly array

const mutableObj = { x: 1, y: 2 };
const readonlyObj = castReadonly(mutableObj);
// readonlyObj.x = 5; // ❌ TypeScript Error: cannot assign to readonly property
```

```typescript
// Prevent callers from mutating internal state
class UserService {
    private users: User[] = [];

    getUsers(): readonly User[] {
        return castReadonly(this.users); // Callers can't mutate the array
    }
}

const service = new UserService();
const users = service.getUsers();
// users.push(newUser); // ❌ TypeScript prevents this
```

```typescript
// Start with mutable object for initialization
const config = {
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3,
};

// Validate and process config...

// Export as readonly to prevent modifications
export const APP_CONFIG = castReadonly(config);
// APP_CONFIG.timeout = 10000; // ❌ TypeScript Error
```

```typescript
const numbers: number[] = [1, 2, 3, 4, 5];
const readonlyNumbers = castReadonly(numbers);

// Read operations still work
const doubled = readonlyNumbers.map((n) => n * 2); // ✅ Returns new array
const sum = readonlyNumbers.reduce((a, b) => a + b, 0); // ✅ Works
const first = readonlyNumbers[0]; // ✅ Reading is allowed

// Mutations are prevented
// readonlyNumbers[0] = 10; // ❌ TypeScript Error
// readonlyNumbers.sort(); // ❌ TypeScript Error (sort mutates)
```

#### See

- castDeepReadonly - For deeply nested structures
- castMutable - For the opposite operation (use with caution)
