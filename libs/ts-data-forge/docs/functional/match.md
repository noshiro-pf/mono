[**Documentation**](../README.md)

---

[Documentation](../README.md) / functional/match

# functional/match

## Functions

### match()

#### Call Signature

> **match**\<`Case`, `R`\>(`target`, `cases`): `R`\[`Case`\]

Defined in: [src/functional/match.mts:158](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/match.mts#L158)

Type-safe pattern matching function for string-based discriminated unions.

Provides compile-time guarantees for exhaustive case handling when working with
literal string unions. Automatically enforces completeness checking when all
cases are covered, and requires a default value when cases are incomplete.

## Key Features:

- **Exhaustive Matching**: When all cases of a literal union are handled, no default value is needed
- **Partial Matching**: When cases are incomplete or working with general string types, a default value is required
- **Type Safety**: Prevents extra cases and ensures only valid keys are used
- **Strict Property Checking**: Rejects objects with unexpected properties

##### Type Parameters

###### Case

`Case` _extends_ `string`

###### R

`R` _extends_ `Readonly`\<`Record`\<`Case`, `unknown`\>\>

##### Parameters

###### target

`Case`

The value to match against

###### cases

`StrictPropertyCheck`\<`R`, `Case`\>

Object mapping possible values to their corresponding results

##### Returns

`R`\[`Case`\]

The matched result or default value

##### Examples

Exhaustive matching (no default needed):

```typescript
type Status = 'loading' | 'success' | 'error';
const status: Status = 'loading';

const message = match(status, {
    loading: 'Please wait...',
    success: 'Operation completed!',
    error: 'Something went wrong',
});
// Type: string
// Result: 'Please wait...'
```

Partial matching (default required):

```typescript
type Priority = 'low' | 'medium' | 'high' | 'critical';
const priority: Priority = 'medium';

const color = match(
    priority,
    {
        high: 'red',
        critical: 'darkred',
    },
    'gray',
); // Default required for uncovered cases
// Type: 'red' | 'darkred' | 'gray'
// Result: 'gray'
```

Working with general string types:

```typescript
const userInput: string = getUserInput();

const route = match(
    userInput,
    {
        home: '/',
        about: '/about',
        contact: '/contact',
    },
    '/404',
); // Default required for string type
// Type: '/' | '/about' | '/contact' | '/404'
```

HTTP status code handling:

```typescript
type HttpStatus = 200 | 404 | 500;
const status: HttpStatus = 404;

const response = match(String(status), {
    '200': { ok: true, message: 'Success' },
    '404': { ok: false, message: 'Not Found' },
    '500': { ok: false, message: 'Server Error' },
});
// All cases covered, no default needed
// Result: { ok: false, message: 'Not Found' }
```

Complex discriminated union handling:

```typescript
type ApiResponse =
    | { status: 'loading' }
    | { status: 'success'; data: string }
    | { status: 'error'; error: string };

const handleResponse = (response: ApiResponse) =>
    match(response.status, {
        loading: 'Please wait...',
        success: 'Data loaded successfully!',
        error: 'Failed to load data',
    });
```

Advanced usage with functional composition:

```typescript
// Creating reusable matchers
const logLevelToColor = (level: string) =>
    match(
        level,
        {
            debug: 'gray',
            info: 'blue',
            warn: 'yellow',
            error: 'red',
        },
        'black',
    ); // Default for unknown levels

const logLevelToIcon = (level: string) =>
    match(
        level,
        {
            debug: '🐛',
            info: 'ℹ️',
            warn: '⚠️',
            error: '❌',
        },
        '📝',
    );

// Combining matchers
const formatLogEntry = (level: string, message: string) => ({
    color: logLevelToColor(level),
    icon: logLevelToIcon(level),
    text: `${logLevelToIcon(level)} ${message}`,
});
```

#### Call Signature

> **match**\<`Case`, `R`, `D`\>(`target`, `cases`, `defaultValue`): `D` \| `ValueOf`\<`R`\>

Defined in: [src/functional/match.mts:163](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/match.mts#L163)

Type-safe pattern matching function for string-based discriminated unions.

Provides compile-time guarantees for exhaustive case handling when working with
literal string unions. Automatically enforces completeness checking when all
cases are covered, and requires a default value when cases are incomplete.

## Key Features:

- **Exhaustive Matching**: When all cases of a literal union are handled, no default value is needed
- **Partial Matching**: When cases are incomplete or working with general string types, a default value is required
- **Type Safety**: Prevents extra cases and ensures only valid keys are used
- **Strict Property Checking**: Rejects objects with unexpected properties

##### Type Parameters

###### Case

`Case` _extends_ `string`

###### R

`R` _extends_ `UnknownRecord`

###### D

`D`

##### Parameters

###### target

`Case`

The value to match against

###### cases

`StrictPropertyCheck`\<`R`, `Case`\>

Object mapping possible values to their corresponding results

###### defaultValue

`IsLiteralUnionFullyCovered`\<`Case`, `R`\> _extends_ `true` ? `never` : `D`

Fallback value (required when not all cases are covered)

##### Returns

`D` \| `ValueOf`\<`R`\>

The matched result or default value

##### Examples

Exhaustive matching (no default needed):

```typescript
type Status = 'loading' | 'success' | 'error';
const status: Status = 'loading';

const message = match(status, {
    loading: 'Please wait...',
    success: 'Operation completed!',
    error: 'Something went wrong',
});
// Type: string
// Result: 'Please wait...'
```

Partial matching (default required):

```typescript
type Priority = 'low' | 'medium' | 'high' | 'critical';
const priority: Priority = 'medium';

const color = match(
    priority,
    {
        high: 'red',
        critical: 'darkred',
    },
    'gray',
); // Default required for uncovered cases
// Type: 'red' | 'darkred' | 'gray'
// Result: 'gray'
```

Working with general string types:

```typescript
const userInput: string = getUserInput();

const route = match(
    userInput,
    {
        home: '/',
        about: '/about',
        contact: '/contact',
    },
    '/404',
); // Default required for string type
// Type: '/' | '/about' | '/contact' | '/404'
```

HTTP status code handling:

```typescript
type HttpStatus = 200 | 404 | 500;
const status: HttpStatus = 404;

const response = match(String(status), {
    '200': { ok: true, message: 'Success' },
    '404': { ok: false, message: 'Not Found' },
    '500': { ok: false, message: 'Server Error' },
});
// All cases covered, no default needed
// Result: { ok: false, message: 'Not Found' }
```

Complex discriminated union handling:

```typescript
type ApiResponse =
    | { status: 'loading' }
    | { status: 'success'; data: string }
    | { status: 'error'; error: string };

const handleResponse = (response: ApiResponse) =>
    match(response.status, {
        loading: 'Please wait...',
        success: 'Data loaded successfully!',
        error: 'Failed to load data',
    });
```

Advanced usage with functional composition:

```typescript
// Creating reusable matchers
const logLevelToColor = (level: string) =>
    match(
        level,
        {
            debug: 'gray',
            info: 'blue',
            warn: 'yellow',
            error: 'red',
        },
        'black',
    ); // Default for unknown levels

const logLevelToIcon = (level: string) =>
    match(
        level,
        {
            debug: '🐛',
            info: 'ℹ️',
            warn: '⚠️',
            error: '❌',
        },
        '📝',
    );

// Combining matchers
const formatLogEntry = (level: string, message: string) => ({
    color: logLevelToColor(level),
    icon: logLevelToIcon(level),
    text: `${logLevelToIcon(level)} ${message}`,
});
```
