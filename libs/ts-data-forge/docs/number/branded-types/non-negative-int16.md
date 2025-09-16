[**ts-data-forge**](../../README.md)

---

[ts-data-forge](../../README.md) / number/branded-types/non-negative-int16

# number/branded-types/non-negative-int16

## Variables

### asNonNegativeInt16()

> `const` **asNonNegativeInt16**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/non-negative-int16.mts:53](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-negative-int16.mts#L53)

Casts a number to a NonNegativeInt16 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonNegativeInt16 type.

#### Throws

If the value is not a non-negative integer in [0, 2^15).

#### Example

```typescript
const x = asNonNegativeInt16(1000); // NonNegativeInt16
const y = asNonNegativeInt16(0); // NonNegativeInt16
// asNonNegativeInt16(-1); // throws TypeError
// asNonNegativeInt16(32768); // throws TypeError
```

---

### isNonNegativeInt16()

> `const` **isNonNegativeInt16**: (`a`) => `a is NonNegativeInt16` = `is`

Defined in: [src/number/branded-types/non-negative-int16.mts:38](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-negative-int16.mts#L38)

Checks if a number is a NonNegativeInt16 (16-bit non-negative signed integer in the range [0, 2^15)).

#### Parameters

##### a

`number`

#### Returns

`a is NonNegativeInt16`

`true` if the value is a NonNegativeInt16, `false` otherwise.

---

### NonNegativeInt16

> `const` **NonNegativeInt16**: `object`

Defined in: [src/number/branded-types/non-negative-int16.mts:83](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-negative-int16.mts#L83)

Namespace providing type-safe arithmetic operations for 16-bit non-negative integers.

All operations automatically clamp results to the valid NonNegativeInt16 range [0, 32767].
This ensures that all arithmetic maintains the 16-bit non-negative integer constraint,
with negative results clamped to 0 and overflow results clamped to MAX_VALUE.

#### Type Declaration

##### add()

> **add**: (`x`, `y`) => `NonNegativeInt16`

Adds two NonNegativeInt16 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonNegativeInt16`

`a + b` clamped to [0, 32767] as a NonNegativeInt16.

##### clamp()

> **clamp**: (`x`) => `NonNegativeInt16`

Clamps a number to the NonNegativeInt16 range.

###### Parameters

###### x

`number`

###### Returns

`NonNegativeInt16`

The value clamped to [0, 32767] as a NonNegativeInt16.

##### div()

> **div**: (`x`, `y`) => `NonNegativeInt16`

Divides one NonNegativeInt16 by another using floor division.

###### Parameters

###### x

`WithSmallInt`

###### y

`ToNonZeroIntWithSmallInt`\<`NonNegativeInt16`\>

###### Returns

`NonNegativeInt16`

`⌊a / b⌋` clamped to [0, 32767] as a NonNegativeInt16.

##### is()

> **is**: (`a`) => `a is NonNegativeInt16`

Type guard to check if a value is a NonNegativeInt16.

###### Parameters

###### a

`number`

###### Returns

`a is NonNegativeInt16`

`true` if the value is a 16-bit non-negative integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `NonNegativeInt16` = `max_`

Returns the larger of two NonNegativeInt16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonNegativeInt16`, `40`\>[]

###### Returns

`NonNegativeInt16`

The maximum value as a NonNegativeInt16.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 16-bit non-negative integer.

##### min()

> `readonly` **min**: (...`values`) => `NonNegativeInt16` = `min_`

Returns the smaller of two NonNegativeInt16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonNegativeInt16`, `40`\>[]

###### Returns

`NonNegativeInt16`

The minimum value as a NonNegativeInt16.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `0`

The minimum value for a 16-bit non-negative integer.

##### mul()

> **mul**: (`x`, `y`) => `NonNegativeInt16`

Multiplies two NonNegativeInt16 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonNegativeInt16`

`a * b` clamped to [0, 32767] as a NonNegativeInt16.

##### pow()

> **pow**: (`x`, `y`) => `NonNegativeInt16`

Raises a NonNegativeInt16 to the power of another NonNegativeInt16.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonNegativeInt16`

`a ** b` clamped to [0, 32767] as a NonNegativeInt16.

##### random()

> **random**: (`min?`, `max?`) => `NonNegativeInt16`

Generates a random NonNegativeInt16 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`NonNegativeInt16`, `40`\>

###### max?

`WithSmallInt`\<`NonNegativeInt16`, `40`\>

###### Returns

`NonNegativeInt16`

A random NonNegativeInt16 between 0 and 32767.

##### sub()

> **sub**: (`x`, `y`) => `NonNegativeInt16`

Subtracts one NonNegativeInt16 from another.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonNegativeInt16`

`a - b` clamped to [0, 32767] as a NonNegativeInt16 (minimum 0).

#### Example

```typescript
const a = asNonNegativeInt16(30000);
const b = asNonNegativeInt16(5000);

// Arithmetic operations with automatic clamping
const sum = NonNegativeInt16.add(a, b); // NonNegativeInt16 (32767 - clamped to MAX_VALUE)
const diff = NonNegativeInt16.sub(a, b); // NonNegativeInt16 (25000)
const reverseDiff = NonNegativeInt16.sub(b, a); // NonNegativeInt16 (0 - clamped to MIN_VALUE)
const product = NonNegativeInt16.mul(a, b); // NonNegativeInt16 (32767 - clamped due to overflow)

// Range operations
const clamped = NonNegativeInt16.clamp(-100); // NonNegativeInt16 (0)
const minimum = NonNegativeInt16.min(a, b); // NonNegativeInt16 (5000)
const maximum = NonNegativeInt16.max(a, b); // NonNegativeInt16 (30000)

// Utility operations
const random = NonNegativeInt16.random(); // NonNegativeInt16 (random value in [0, 32767])
const power = NonNegativeInt16.pow(
    asNonNegativeInt16(2),
    asNonNegativeInt16(10),
); // NonNegativeInt16 (1024)
```
