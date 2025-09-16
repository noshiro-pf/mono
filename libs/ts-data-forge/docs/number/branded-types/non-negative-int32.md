[**ts-data-forge**](../../README.md)

---

[ts-data-forge](../../README.md) / number/branded-types/non-negative-int32

# number/branded-types/non-negative-int32

## Variables

### asNonNegativeInt32()

> `const` **asNonNegativeInt32**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/non-negative-int32.mts:53](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-negative-int32.mts#L53)

Casts a number to a NonNegativeInt32 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a NonNegativeInt32 type.

#### Throws

If the value is not a non-negative integer in [0, 2^31).

#### Example

```typescript
const x = asNonNegativeInt32(1000); // NonNegativeInt32
const y = asNonNegativeInt32(0); // NonNegativeInt32
// asNonNegativeInt32(-1); // throws TypeError
// asNonNegativeInt32(2147483648); // throws TypeError
```

---

### isNonNegativeInt32()

> `const` **isNonNegativeInt32**: (`a`) => `a is NonNegativeInt32` = `is`

Defined in: [src/number/branded-types/non-negative-int32.mts:38](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-negative-int32.mts#L38)

Checks if a number is a NonNegativeInt32 (32-bit non-negative signed integer in the range [0, 2^31)).

#### Parameters

##### a

`number`

#### Returns

`a is NonNegativeInt32`

`true` if the value is a NonNegativeInt32, `false` otherwise.

---

### NonNegativeInt32

> `const` **NonNegativeInt32**: `object`

Defined in: [src/number/branded-types/non-negative-int32.mts:83](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/non-negative-int32.mts#L83)

Namespace providing type-safe arithmetic operations for 32-bit non-negative integers.

All operations automatically clamp results to the valid NonNegativeInt32 range [0, 2147483647].
This ensures that all arithmetic maintains the 32-bit non-negative integer constraint,
with negative results clamped to 0 and overflow results clamped to MAX_VALUE.

#### Type Declaration

##### add()

> **add**: (`x`, `y`) => `NonNegativeInt32`

Adds two NonNegativeInt32 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonNegativeInt32`

`a + b` clamped to [0, 2147483647] as a NonNegativeInt32.

##### clamp()

> **clamp**: (`x`) => `NonNegativeInt32`

Clamps a number to the NonNegativeInt32 range.

###### Parameters

###### x

`number`

###### Returns

`NonNegativeInt32`

The value clamped to [0, 2147483647] as a NonNegativeInt32.

##### div()

> **div**: (`x`, `y`) => `NonNegativeInt32`

Divides one NonNegativeInt32 by another using floor division.

###### Parameters

###### x

`WithSmallInt`

###### y

`ToNonZeroIntWithSmallInt`\<`NonNegativeInt32`\>

###### Returns

`NonNegativeInt32`

`⌊a / b⌋` clamped to [0, 2147483647] as a NonNegativeInt32.

##### is()

> **is**: (`a`) => `a is NonNegativeInt32`

Type guard to check if a value is a NonNegativeInt32.

###### Parameters

###### a

`number`

###### Returns

`a is NonNegativeInt32`

`true` if the value is a 32-bit non-negative integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `NonNegativeInt32` = `max_`

Returns the larger of two NonNegativeInt32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonNegativeInt32`, `40`\>[]

###### Returns

`NonNegativeInt32`

The maximum value as a NonNegativeInt32.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 32-bit non-negative integer.

##### min()

> `readonly` **min**: (...`values`) => `NonNegativeInt32` = `min_`

Returns the smaller of two NonNegativeInt32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`NonNegativeInt32`, `40`\>[]

###### Returns

`NonNegativeInt32`

The minimum value as a NonNegativeInt32.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `0`

The minimum value for a 32-bit non-negative integer.

##### mul()

> **mul**: (`x`, `y`) => `NonNegativeInt32`

Multiplies two NonNegativeInt32 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonNegativeInt32`

`a * b` clamped to [0, 2147483647] as a NonNegativeInt32.

##### pow()

> **pow**: (`x`, `y`) => `NonNegativeInt32`

Raises a NonNegativeInt32 to the power of another NonNegativeInt32.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonNegativeInt32`

`a ** b` clamped to [0, 2147483647] as a NonNegativeInt32.

##### random()

> **random**: (`min?`, `max?`) => `NonNegativeInt32`

Generates a random NonNegativeInt32 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`NonNegativeInt32`, `40`\>

###### max?

`WithSmallInt`\<`NonNegativeInt32`, `40`\>

###### Returns

`NonNegativeInt32`

A random NonNegativeInt32 between 0 and 2147483647.

##### sub()

> **sub**: (`x`, `y`) => `NonNegativeInt32`

Subtracts one NonNegativeInt32 from another.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`NonNegativeInt32`

`a - b` clamped to [0, 2147483647] as a NonNegativeInt32 (minimum 0).

#### Example

```typescript
const a = asNonNegativeInt32(2000000000);
const b = asNonNegativeInt32(500000000);

// Arithmetic operations with automatic clamping
const sum = NonNegativeInt32.add(a, b); // NonNegativeInt32 (2147483647 - clamped to MAX_VALUE)
const diff = NonNegativeInt32.sub(a, b); // NonNegativeInt32 (1500000000)
const reverseDiff = NonNegativeInt32.sub(b, a); // NonNegativeInt32 (0 - clamped to MIN_VALUE)
const product = NonNegativeInt32.mul(a, b); // NonNegativeInt32 (2147483647 - clamped due to overflow)

// Range operations
const clamped = NonNegativeInt32.clamp(-1000); // NonNegativeInt32 (0)
const minimum = NonNegativeInt32.min(a, b); // NonNegativeInt32 (500000000)
const maximum = NonNegativeInt32.max(a, b); // NonNegativeInt32 (2000000000)

// Utility operations
const random = NonNegativeInt32.random(); // NonNegativeInt32 (random value in [0, 2147483647])
const power = NonNegativeInt32.pow(
    asNonNegativeInt32(2),
    asNonNegativeInt32(20),
); // NonNegativeInt32 (1048576)
```
