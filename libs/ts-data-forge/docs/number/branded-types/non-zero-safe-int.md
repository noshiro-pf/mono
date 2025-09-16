[**ts-data-forge**](../../README.md)

---

[ts-data-forge](../../README.md) / number/branded-types/non-zero-safe-int

# number/branded-types/non-zero-safe-int

## Variables

### asNonZeroSafeInt()

> `const` **asNonZeroSafeInt**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/non-zero-safe-int.mts:57](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-zero-safe-int.mts#L57)

Casts a number to a NonZeroSafeInt type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonZeroSafeInt type.

#### Throws

If the value is not a non-zero safe integer.

#### Example

```typescript
const x = asNonZeroSafeInt(5); // NonZeroSafeInt
const y = asNonZeroSafeInt(-1000); // NonZeroSafeInt
// asNonZeroSafeInt(0); // throws TypeError
// asNonZeroSafeInt(1.5); // throws TypeError
```

---

### isNonZeroSafeInt()

> `const` **isNonZeroSafeInt**: (`a`) => `a is NonZeroSafeInt` = `is`

Defined in: [src/number/branded-types/non-zero-safe-int.mts:42](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-zero-safe-int.mts#L42)

Checks if a number is a NonZeroSafeInt (a non-zero safe integer in the range [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] excluding 0).

#### Parameters

##### a

`number`

#### Returns

`a is NonZeroSafeInt`

`true` if the value is a NonZeroSafeInt, `false` otherwise.

---

### NonZeroSafeInt

> `const` **NonZeroSafeInt**: `object`

Defined in: [src/number/branded-types/non-zero-safe-int.mts:85](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-zero-safe-int.mts#L85)

Namespace providing type-safe arithmetic operations for non-zero safe integers.

All operations automatically clamp results to the non-zero safe integer range, excluding zero.
This ensures that all arithmetic maintains both the non-zero constraint and IEEE 754 precision guarantees,
preventing precision loss while ensuring results are never zero.

#### Type Declaration

##### abs()

> **abs**: (`x`) => `ToNonNegative`\<`NonZeroSafeInt`\>

Returns the absolute value of a non-zero safe integer.

###### Parameters

###### x

`WithSmallInt`

###### Returns

`ToNonNegative`\<`NonZeroSafeInt`\>

The absolute value as a NonZeroSafeInt, clamped to safe range.

##### add()

> **add**: (`x`, `y`) => `NonZeroSafeInt`

Adds two NonZeroSafeInt values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonZeroSafeInt`

`a + b` clamped to non-zero safe integer range as a NonZeroSafeInt.

##### clamp()

> **clamp**: (`x`) => `NonZeroSafeInt`

Clamps a number to the non-zero safe integer range.

###### Parameters

###### x

`number`

###### Returns

`NonZeroSafeInt`

The value clamped to [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] \ {0} as a NonZeroSafeInt.

##### div()

> **div**: (`x`, `y`) => `NonZeroSafeInt`

Divides one NonZeroSafeInt by another using floor division.

###### Parameters

###### x

`WithSmallInt`

###### y

`ToNonZeroIntWithSmallInt`\<`NonZeroSafeInt`\>

###### Returns

`NonZeroSafeInt`

`⌊a / b⌋` clamped to non-zero safe integer range as a NonZeroSafeInt.

##### is()

> **is**: (`a`) => `a is NonZeroSafeInt`

Type guard to check if a value is a NonZeroSafeInt.

###### Parameters

###### a

`number`

###### Returns

`a is NonZeroSafeInt`

`true` if the value is a non-zero safe integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `NonZeroSafeInt` = `max_`

Returns the larger of two NonZeroSafeInt values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonZeroSafeInt`, `40`\>[]

###### Returns

`NonZeroSafeInt`

The maximum value as a NonZeroSafeInt.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `SafeUint`

The maximum safe integer value (2^53 - 1).

##### min()

> `readonly` **min**: (...`values`) => `NonZeroSafeInt` = `min_`

Returns the smaller of two NonZeroSafeInt values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonZeroSafeInt`, `40`\>[]

###### Returns

`NonZeroSafeInt`

The minimum value as a NonZeroSafeInt.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `SafeInt`

The minimum safe integer value (-(2^53 - 1)).

##### mul()

> **mul**: (`x`, `y`) => `NonZeroSafeInt`

Multiplies two NonZeroSafeInt values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonZeroSafeInt`

`a * b` clamped to non-zero safe integer range as a NonZeroSafeInt.

##### pow()

> **pow**: (`x`, `y`) => `NonZeroSafeInt`

Raises a NonZeroSafeInt to the power of another NonZeroSafeInt.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonZeroSafeInt`

`a ** b` clamped to non-zero safe integer range as a NonZeroSafeInt.

##### random()

> **random**: (`min?`, `max?`) => `NonZeroSafeInt`

Generates a random NonZeroSafeInt value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`NonZeroSafeInt`, `40`\>

###### max?

`WithSmallInt`\<`NonZeroSafeInt`, `40`\>

###### Returns

`NonZeroSafeInt`

A random non-zero safe integer between MIN_SAFE_INTEGER and MAX_SAFE_INTEGER.

##### sub()

> **sub**: (`x`, `y`) => `NonZeroSafeInt`

Subtracts one NonZeroSafeInt from another.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonZeroSafeInt`

`a - b` clamped to non-zero safe integer range as a NonZeroSafeInt.

#### Example

```typescript
const a = asNonZeroSafeInt(9007199254740000); // Near MAX_SAFE_INTEGER
const b = asNonZeroSafeInt(-1000);

// Arithmetic operations with non-zero safe range clamping
const sum = NonZeroSafeInt.add(a, b); // NonZeroSafeInt (9007199254739000)
const diff = NonZeroSafeInt.sub(a, b); // NonZeroSafeInt (clamped to MAX_SAFE_INTEGER)
const product = NonZeroSafeInt.mul(a, b); // NonZeroSafeInt (clamped to MIN_SAFE_INTEGER)

// Utility operations
const absolute = NonZeroSafeInt.abs(b); // NonZeroSafeInt (1000)
const minimum = NonZeroSafeInt.min(a, b); // NonZeroSafeInt (-1000)
const maximum = NonZeroSafeInt.max(a, b); // NonZeroSafeInt (a)

// Random generation
const random = NonZeroSafeInt.random(); // NonZeroSafeInt (random non-zero safe integer)
```
