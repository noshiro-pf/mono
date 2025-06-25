[**Documentation**](../../README.md)

---

[Documentation](../../README.md) / number/branded-types/positive-int16

# number/branded-types/positive-int16

## Variables

### asPositiveInt16()

> `const` **asPositiveInt16**: \<`N`\>(`x`) => `number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N` = `castType`

Defined in: [src/number/branded-types/positive-int16.mts:54](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/positive-int16.mts#L54)

Casts a number to a PositiveInt16 type.

#### Type Parameters

##### N

`N` _extends_ `number`

#### Parameters

##### x

`N`

#### Returns

`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `N`

The value as a PositiveInt16 type.

#### Throws

If the value is not a positive integer in [1, 2^15).

#### Example

```typescript
const x = asPositiveInt16(1000); // PositiveInt16
const y = asPositiveInt16(32767); // PositiveInt16
// asPositiveInt16(0); // throws TypeError
// asPositiveInt16(-1); // throws TypeError
// asPositiveInt16(32768); // throws TypeError
```

---

### isPositiveInt16()

> `const` **isPositiveInt16**: (`a`) => `a is PositiveInt16` = `is`

Defined in: [src/number/branded-types/positive-int16.mts:38](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/positive-int16.mts#L38)

Checks if a number is a PositiveInt16 (16-bit positive signed integer in the range [1, 2^15)).

#### Parameters

##### a

`number`

#### Returns

`a is PositiveInt16`

`true` if the value is a PositiveInt16, `false` otherwise.

---

### PositiveInt16

> `const` **PositiveInt16**: `object`

Defined in: [src/number/branded-types/positive-int16.mts:84](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/number/branded-types/positive-int16.mts#L84)

Namespace providing type-safe arithmetic operations for 16-bit positive integers.

All operations automatically clamp results to the valid PositiveInt16 range [1, 32767].
This ensures that all arithmetic maintains the 16-bit positive integer constraint,
with results below 1 clamped to MIN_VALUE and overflow results clamped to MAX_VALUE.

#### Type declaration

##### add()

> **add**: (`x`, `y`) => `PositiveInt16`

Adds two PositiveInt16 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveInt16`

`a + b` clamped to [1, 32767] as a PositiveInt16.

##### clamp()

> **clamp**: (`x`) => `PositiveInt16`

Clamps a number to the PositiveInt16 range.

###### Parameters

###### x

`number`

###### Returns

`PositiveInt16`

The value clamped to [1, 32767] as a PositiveInt16.

##### div()

> **div**: (`x`, `y`) => `PositiveInt16`

Divides one PositiveInt16 by another using floor division.

###### Parameters

###### x

`WithSmallInt`

###### y

`ToNonZeroIntWithSmallInt`\<`PositiveInt16`\>

###### Returns

`PositiveInt16`

`⌊a / b⌋` clamped to [1, 32767] as a PositiveInt16.

##### is()

> **is**: (`a`) => `a is PositiveInt16`

Type guard to check if a value is a PositiveInt16.

###### Parameters

###### a

`number`

###### Returns

`a is PositiveInt16`

`true` if the value is a 16-bit positive integer, `false` otherwise.

##### max()

> `readonly` **max**: (...`values`) => `PositiveInt16` = `max_`

Returns the larger of two PositiveInt16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveInt16`, `40`\>[]

###### Returns

`PositiveInt16`

The maximum value as a PositiveInt16.

##### MAX_VALUE

> `readonly` **MAX_VALUE**: `number`

The maximum value for a 16-bit positive integer.

##### min()

> `readonly` **min**: (...`values`) => `PositiveInt16` = `min_`

Returns the smaller of two PositiveInt16 values.

###### Parameters

###### values

...readonly `WithSmallInt`\<`PositiveInt16`, `40`\>[]

###### Returns

`PositiveInt16`

The minimum value as a PositiveInt16.

##### MIN_VALUE

> `readonly` **MIN_VALUE**: `1`

The minimum value for a 16-bit positive integer.

##### mul()

> **mul**: (`x`, `y`) => `PositiveInt16`

Multiplies two PositiveInt16 values.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveInt16`

`a * b` clamped to [1, 32767] as a PositiveInt16.

##### pow()

> **pow**: (`x`, `y`) => `PositiveInt16`

Raises a PositiveInt16 to the power of another PositiveInt16.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveInt16`

`a ** b` clamped to [1, 32767] as a PositiveInt16.

##### random()

> **random**: (`min?`, `max?`) => `PositiveInt16`

Generates a random PositiveInt16 value within the valid range.

###### Parameters

###### min?

`WithSmallInt`\<`PositiveInt16`, `40`\>

###### max?

`WithSmallInt`\<`PositiveInt16`, `40`\>

###### Returns

`PositiveInt16`

A random PositiveInt16 between 1 and 32767.

##### sub()

> **sub**: (`x`, `y`) => `PositiveInt16`

Subtracts one PositiveInt16 from another.

###### Parameters

###### x

`WithSmallInt`

###### y

`WithSmallInt`

###### Returns

`PositiveInt16`

`a - b` clamped to [1, 32767] as a PositiveInt16 (minimum 1).

#### Example

```typescript
const a = asPositiveInt16(30000);
const b = asPositiveInt16(5000);

// Arithmetic operations with automatic clamping
const sum = PositiveInt16.add(a, b); // PositiveInt16 (32767 - clamped to MAX_VALUE)
const diff = PositiveInt16.sub(a, b); // PositiveInt16 (25000)
const reverseDiff = PositiveInt16.sub(b, a); // PositiveInt16 (1 - clamped to MIN_VALUE)
const product = PositiveInt16.mul(a, b); // PositiveInt16 (32767 - clamped due to overflow)

// Range operations
const clamped = PositiveInt16.clamp(0); // PositiveInt16 (1)
const minimum = PositiveInt16.min(a, b); // PositiveInt16 (5000)
const maximum = PositiveInt16.max(a, b); // PositiveInt16 (30000)

// Utility operations
const random = PositiveInt16.random(); // PositiveInt16 (random value in [1, 32767])
const power = PositiveInt16.pow(asPositiveInt16(2), asPositiveInt16(10)); // PositiveInt16 (1024)
```
