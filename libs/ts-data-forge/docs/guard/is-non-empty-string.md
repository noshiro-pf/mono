[**ts-data-forge**](../README.md)

---

[ts-data-forge](../README.md) / guard/is-non-empty-string

# guard/is-non-empty-string

## Functions

### isNonEmptyString()

> **isNonEmptyString**\<`S`\>(`s`): `s is RelaxedExclude<NonNullable<S>, "">`

Defined in: [src/guard/is-non-empty-string.mts:105](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/guard/is-non-empty-string.mts#L105)

Type guard that checks if a value is a non-empty string.

This function performs both a type check (ensuring the value is a string) and a length check
(ensuring the string is not empty). It acts as a type guard that narrows the input type to
exclude `null`, `undefined`, and empty strings.

**Type Narrowing Behavior:**

- Eliminates `null` and `undefined` from the type
- Excludes empty string (`""`) from the type
- Preserves literal string types when possible
- Whitespace-only strings are considered non-empty

#### Type Parameters

##### S

`S` _extends_ `undefined` \| `null` \| `string`

The input type, which can include `string`, `null`, or `undefined`

#### Parameters

##### s

`S`

The value to check

#### Returns

`s is RelaxedExclude<NonNullable<S>, "">`

`true` if `s` is a string with length > 0, `false` otherwise.
When `true`, TypeScript narrows the type to exclude empty strings and nullish values.

#### Examples

Basic usage with different string types:

```typescript
isNonEmptyString('hello'); // true
isNonEmptyString(' '); // true (whitespace is considered non-empty)
isNonEmptyString('\t\n'); // true (whitespace characters are non-empty)
isNonEmptyString(''); // false
isNonEmptyString(null); // false
isNonEmptyString(undefined); // false
```

Type guard usage with nullable strings:

```typescript
const userInput: string | null | undefined = getUserInput();

if (isNonEmptyString(userInput)) {
    // userInput is now typed as non-empty string
    console.log(userInput.charAt(0)); // Safe to access string methods
    console.log(userInput.toUpperCase()); // No need for null checks
    const length = userInput.length; // Guaranteed to be > 0
} else {
    console.log('No valid input provided');
}
```

Working with literal string types:

```typescript
type Status = 'active' | 'inactive' | '' | null;
const status: Status = getStatus();

if (isNonEmptyString(status)) {
    // status is now typed as "active" | "inactive"
    console.log(`Status is: ${status}`);
}
```

Form validation patterns:

```typescript
interface FormData {
    name?: string;
    email?: string;
    phone?: string;
}

function validateForm(data: FormData): string[] {
    const errors: string[] = [];

    if (!isNonEmptyString(data.name)) {
        errors.push('Name is required');
    }

    if (!isNonEmptyString(data.email)) {
        errors.push('Email is required');
    } else if (!data.email.includes('@')) {
        // Safe to access string methods after guard
        errors.push('Invalid email format');
    }

    return errors;
}
```

Filtering arrays of potentially empty strings:

```typescript
const responses: (string | null | undefined)[] = [
    'hello',
    '',
    'world',
    null,
    undefined,
    ' ',
];

const validResponses = responses.filter(isNonEmptyString);
// validResponses is now string[] containing ["hello", "world", " "]

validResponses.forEach((response) => {
    // Each response is guaranteed to be a non-empty string
    console.log(response.trim().toUpperCase());
});
```
