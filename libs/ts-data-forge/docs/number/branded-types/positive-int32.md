[**ts-data-forge**](../../README.md)

---

[ts-data-forge](../../README.md) / number/branded-types/positive-int32

# number/branded-types/positive-int32

## Variables

### asPositiveInt32()

> `const` **asPositiveInt32**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/positive-int32.mts:54](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/positive-int32.mts#L54)

Casts a number to a PositiveInt32 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a PositiveInt32 type.

#### Throws

If the value is not a positive integer in [1, 2^31).

#### Example

```typescript
const x = asPositiveInt32(1000); // PositiveInt32
const y = asPositiveInt32(2147483647); // PositiveInt32
// asPositiveInt32(0); // throws TypeError
// asPositiveInt32(-1); // throws TypeError
// asPositiveInt32(2147483648); // throws TypeError
```

---

### isPositiveInt32()

> `const` **isPositiveInt32**: (`a`) => `a is PositiveInt32` = `is`

Defined in: [src/number/branded-types/positive-int32.mts:38](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/positive-int32.mts#L38)

Checks if a number is a PositiveInt32 (32-bit positive signed integer in the range [1, 2^31)).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveInt32`

`true` if the value is a PositiveInt32, `false` otherwise.

---

### PositiveInt32

> `const` **PositiveInt32**: `object`

Defined in: [src/number/branded-types/positive-int32.mts:84](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/positive-int32.mts#L84)

Namespace providing type-safe arithmetic operations for 32-bit positive integers.

All operations automatically clamp results to the valid PositiveInt32 range [1, 2147483647].
This ensures that all arithmetic maintains the 32-bit positive integer constraint,
with results below 1 clamped to MIN_VALUE and overflow results clamped to MAX_VALUE.

#### Type Declaration

##### add()

> **add**: (`x`, `y`) => `PositiveInt32`

Adds two PositiveInt32 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveInt32`

`a + b` clamped to [1, 2147483647] as a PositiveInt32.

##### clamp()

> **clamp**: (`x`) => `PositiveInt32`

Clamps a number to the PositiveInt32 range.

###### Parameters

###### x

`number`

###### Returns

`PositiveInt32`

The value clamped to [1, 2147483647] as a PositiveInt32.

##### div()

> **div**: (`x`, `y`) => `PositiveInt32`

Divides one PositiveInt32 by another using floor division.

###### Parameters

###### x

`WithSmallInt`

###### y

`ToNonZeroIntWithSmallInt`\<`PositiveInt32`\>

###### Returns

`PositiveInt32`

`⌊a / b⌋` clamped to [1, 2147483647] as a PositiveInt32.

##### is()

> **is**: (`a`) => `a is PositiveInt32`

Type guard to check if a value is a PositiveInt32.

###### Parameters

###### a

`number`

###### Returns

`a is PositiveInt32`

`true` if the value is a 32-bit positive integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `PositiveInt32` = `max_`

Returns the larger of two PositiveInt32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveInt32`, `40`\>[]

###### Returns

`PositiveInt32`

The maximum value as a PositiveInt32.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 32-bit positive integer.

##### min()

> `readonly` **min**: (...`values`) => `PositiveInt32` = `min_`

Returns the smaller of two PositiveInt32 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveInt32`, `40`\>[]

###### Returns

`PositiveInt32`

The minimum value as a PositiveInt32.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `1`

The minimum value for a 32-bit positive integer.

##### mul()

> **mul**: (`x`, `y`) => `PositiveInt32`

Multiplies two PositiveInt32 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveInt32`

`a * b` clamped to [1, 2147483647] as a PositiveInt32.

##### pow()

> **pow**: (`x`, `y`) => `PositiveInt32`

Raises a PositiveInt32 to the power of another PositiveInt32.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveInt32`

`a ** b` clamped to [1, 2147483647] as a PositiveInt32.

##### random()

> **random**: (`min?`, `max?`) => `PositiveInt32`

Generates a random PositiveInt32 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`PositiveInt32`, `40`\>

###### max?

`WithSmallInt`\<`PositiveInt32`, `40`\>

###### Returns

`PositiveInt32`

A random PositiveInt32 between 1 and 2147483647.

##### sub()

> **sub**: (`x`, `y`) => `PositiveInt32`

Subtracts one PositiveInt32 from another.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveInt32`

`a - b` clamped to [1, 2147483647] as a PositiveInt32 (minimum 1).

#### Example

```typescript
const a = asPositiveInt32(2000000000);
const b = asPositiveInt32(500000000);

// Arithmetic operations with automatic clamping and positive constraint
const sum = PositiveInt32.add(a, b); // PositiveInt32 (2147483647 - clamped to MAX_VALUE)
const diff = PositiveInt32.sub(a, b); // PositiveInt32 (1500000000)
const reverseDiff = PositiveInt32.sub(b, a); // PositiveInt32 (1 - clamped to MIN_VALUE)
const product = PositiveInt32.mul(a, b); // PositiveInt32 (2147483647 - clamped due to overflow)

// Range operations (maintaining positive constraint)
const clamped = PositiveInt32.clamp(-1000); // PositiveInt32 (1)
const minimum = PositiveInt32.min(a, b); // PositiveInt32 (500000000)
const maximum = PositiveInt32.max(a, b); // PositiveInt32 (2000000000)

// Utility operations
const random = PositiveInt32.random(); // PositiveInt32 (random value in [1, 2147483647])
const power = PositiveInt32.pow(asPositiveInt32(2), asPositiveInt32(20)); // PositiveInt32 (1048576)
```
