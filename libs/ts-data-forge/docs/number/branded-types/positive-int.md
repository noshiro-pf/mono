[**ts-data-forge**](../../README.md)

---

[ts-data-forge](../../README.md) / number/branded-types/positive-int

# number/branded-types/positive-int

## Variables

### asPositiveInt()

> `const` **asPositiveInt**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/positive-int.mts:77](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/positive-int.mts#L77)

Casts a number to a PositiveInt branded type.

This function validates that the input is a positive integer (>= 1)
and returns it with the PositiveInt brand. This ensures type safety
for operations that require strictly positive integer values.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a PositiveInt branded type

#### Throws

If the value is not a positive integer

#### Example

```typescript
const count = asPositiveInt(5); // PositiveInt
const length = asPositiveInt(100); // PositiveInt
const one = asPositiveInt(1); // PositiveInt (minimum valid)

// These throw TypeError:
// asPositiveInt(0);                 // Zero is not positive
// asPositiveInt(-1);                // Negative numbers not allowed
// asPositiveInt(5.5);               // Not an integer
// asPositiveInt(Infinity);          // Not finite
```

---

### isPositiveInt()

> `const` **isPositiveInt**: (`a`) => `a is PositiveInt` = `is`

Defined in: [src/number/branded-types/positive-int.mts:51](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/positive-int.mts#L51)

Type guard that checks if a value is a positive integer.

A positive integer is any integer greater than zero (>= 1).
This excludes zero, negative numbers, and non-integers.

#### Parameters

##### a

`number`

#### Returns

`a is PositiveInt`

`true` if the value is a positive integer, `false` otherwise

#### Example

```typescript
isPositiveInt(5); // true
isPositiveInt(1); // true
isPositiveInt(0); // false (zero is not positive)
isPositiveInt(-1); // false (negative)
isPositiveInt(5.5); // false (not an integer)
isPositiveInt(NaN); // false
```

---

### PositiveInt

> `const` **PositiveInt**: `object`

Defined in: [src/number/branded-types/positive-int.mts:123](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/positive-int.mts#L123)

Namespace providing type-safe operations for PositiveInt branded types.

PositiveInt represents integers that are strictly greater than zero (>= 1).
All operations automatically clamp results to maintain the positive constraint,
ensuring that arithmetic operations never produce zero or negative values.

This type is essential for:

- Array lengths and sizes (length >= 1)
- Counts and quantities that must be positive
- Denominators in division operations
- Loop counters and iteration counts
- Database primary keys and IDs

#### Type Declaration

##### add()

> **add**: (`x`, `y`) => `PositiveInt`

Adds two positive integers, ensuring the result is never less than 1.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveInt`

`a + b` as a PositiveInt, but never less than 1

###### Example

```typescript
PositiveInt.add(asPositiveInt(5), asPositiveInt(3)); // PositiveInt (8)
```

##### clamp()

> **clamp**: (`x`) => `PositiveInt`

Clamps a number to the positive integer range.

Since PositiveInt has a minimum value of 1, this function ensures
that any input less than 1 is clamped to 1.

###### Parameters

###### x

`number`

###### Returns

`PositiveInt`

The value clamped to >= 1 as a PositiveInt

###### Example

```typescript
PositiveInt.clamp(5); // PositiveInt (5)
PositiveInt.clamp(0); // PositiveInt (1) - clamped to minimum
PositiveInt.clamp(-10); // PositiveInt (1) - clamped to minimum
PositiveInt.clamp(100); // PositiveInt (100)
```

##### div()

> **div**: (`x`, `y`) => `PositiveInt`

Divides two positive integers using floor division, clamping to remain positive.

Performs mathematical floor division: `⌊a / b⌋`. If the result would be 0
(when a < b), it is clamped to 1 to maintain the positive integer constraint.

###### Parameters

###### x

`WithSmallInt`

###### y

`ToNonZeroIntWithSmallInt`\<`PositiveInt`\>

###### Returns

`PositiveInt`

`max(1, ⌊a / b⌋)` as a PositiveInt

###### Example

```typescript
PositiveInt.div(asPositiveInt(10), asPositiveInt(3)); // PositiveInt (3)
PositiveInt.div(asPositiveInt(9), asPositiveInt(3)); // PositiveInt (3)
PositiveInt.div(asPositiveInt(2), asPositiveInt(3)); // PositiveInt (1) - clamped
PositiveInt.div(asPositiveInt(1), asPositiveInt(5)); // PositiveInt (1) - clamped
```

##### is()

> **is**: (`a`) => `a is PositiveInt`

Type guard that checks if a value is a positive integer.

###### Parameters

###### a

`number`

###### Returns

`a is PositiveInt`

`true` if the value is a positive integer, `false` otherwise

###### See

[isPositiveInt](#ispositiveint) for usage examples

##### max()

> `readonly` **max**: (...`values`) => `PositiveInt` = `max_`

Returns the maximum value from a list of positive integers.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveInt`, `40`\>[]

The positive integers to compare (at least one required)

###### Returns

`PositiveInt`

The largest value as a PositiveInt

###### Example

```typescript
PositiveInt.max(asPositiveInt(5), asPositiveInt(3)); // PositiveInt (5)
PositiveInt.max(asPositiveInt(10), asPositiveInt(1), asPositiveInt(7)); // PositiveInt (10)
```

##### min()

> `readonly` **min**: (...`values`) => `PositiveInt` = `min_`

Returns the minimum value from a list of positive integers.

Since all inputs are guaranteed to be >= 1, the result is also guaranteed
to be a positive integer.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveInt`, `40`\>[]

The positive integers to compare (at least one required)

###### Returns

`PositiveInt`

The smallest value as a PositiveInt

###### Example

```typescript
PositiveInt.min(asPositiveInt(5), asPositiveInt(3)); // PositiveInt (3)
PositiveInt.min(asPositiveInt(10), asPositiveInt(1), asPositiveInt(7)); // PositiveInt (1)
```

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `1`

The minimum value for a PositiveInt.

##### mul()

> **mul**: (`x`, `y`) => `PositiveInt`

Multiplies two positive integers, ensuring the result is never less than 1.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveInt`

`a * b` as a PositiveInt, but never less than 1

###### Example

```typescript
PositiveInt.mul(asPositiveInt(4), asPositiveInt(3)); // PositiveInt (12)
```

##### pow()

> **pow**: (`x`, `y`) => `PositiveInt`

Raises a positive integer to a power, ensuring the result is never less than 1.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveInt`

`a ** b` as a PositiveInt, but never less than 1

###### Example

```typescript
PositiveInt.pow(asPositiveInt(2), asPositiveInt(3)); // PositiveInt (8)
```

##### random()

> **random**: (`min?`, `max?`) => `PositiveInt`

Generates a random positive integer within the specified range (inclusive).

Both bounds are inclusive, and both min and max must be positive integers.
If min > max, they are automatically swapped.

###### Parameters

###### min?

`WithSmallInt`\<`PositiveInt`, `40`\>

The minimum value (inclusive, must be >= 1)

###### max?

`WithSmallInt`\<`PositiveInt`, `40`\>

The maximum value (inclusive, must be >= min)

###### Returns

`PositiveInt`

A random PositiveInt in the range [min, max]

###### Example

```typescript
// Dice roll
const d6 = PositiveInt.random(asPositiveInt(1), asPositiveInt(6));

// Random user ID
const userId = PositiveInt.random(asPositiveInt(1000), asPositiveInt(9999));

// Random page count
const pages = PositiveInt.random(asPositiveInt(50), asPositiveInt(500));
```

##### sub()

> **sub**: (`x`, `y`) => `PositiveInt`

Subtracts two positive integers, clamping the result to remain positive.

If the mathematical result would be <= 0, it is clamped to 1 to maintain
the positive integer constraint.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveInt`

`max(1, a - b)` as a PositiveInt

###### Example

```typescript
PositiveInt.sub(asPositiveInt(8), asPositiveInt(3)); // PositiveInt (5)
PositiveInt.sub(asPositiveInt(3), asPositiveInt(8)); // PositiveInt (1) - clamped
PositiveInt.sub(asPositiveInt(5), asPositiveInt(5)); // PositiveInt (1) - clamped
```

#### Example

```typescript
// Type validation
PositiveInt.is(5); // true
PositiveInt.is(1); // true (minimum value)
PositiveInt.is(0); // false
PositiveInt.is(-1); // false

// Automatic clamping in operations
const a = asPositiveInt(10);
const b = asPositiveInt(3);

const sum = PositiveInt.add(a, b); // PositiveInt (13)
const diff1 = PositiveInt.sub(a, b); // PositiveInt (7)
const diff2 = PositiveInt.sub(b, a); // PositiveInt (1) - clamped!
const product = PositiveInt.mul(a, b); // PositiveInt (30)
const quotient = PositiveInt.div(a, b); // PositiveInt (3)

// Edge case: division that would be < 1
const small = PositiveInt.div(asPositiveInt(2), asPositiveInt(3)); // PositiveInt (1)

// Range operations
const minimum = PositiveInt.min(a, b); // PositiveInt (3)
const maximum = PositiveInt.max(a, b); // PositiveInt (10)

// Random generation
const dice = PositiveInt.random(asPositiveInt(1), asPositiveInt(6)); // 1-6
const id = PositiveInt.random(asPositiveInt(1000), asPositiveInt(9999)); // 4-digit ID
```
